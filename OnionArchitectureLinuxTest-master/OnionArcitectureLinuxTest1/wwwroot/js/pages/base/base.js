function initMap() {
    mapsUtilities.mapsFullyLoadedScript = true;
}
$(document).ready(function () {
    
});

var ExportSources = {
    DOCX:0,
    PDF:1,
    XLSX:2
}

var o_pageBase = {
    s_userName: null,
    userRole: null,
    userPositionLatitude : null,
    userPositionLongitude: null,
    timerId: null,
    orderStatusIds: [],

    // метод получения координат пользователя
    getUserCoordinates: function () {
        mapsUtilities.getCurrentPosition(function (pos) {
            o_pageBase.userPositionLatitude = pos.coords.latitude;
            o_pageBase.userPositionLongitude = pos.coords.longitude;
        });
    },
    getUserRole: function () {
        $.ajax({
            url: '/Account/GetUserRole',
            type: "GET",
            success: function (res) {
                switch (res) {
                    case 1:
                        o_pageBase.userRole = "seller";
                        break;
                    case 2:
                        o_pageBase.userRole = "buyer";
                        break;
                    case 3:
                        o_pageBase.userRole = "admin";
                        break;
				}
			}
        });
	},
    getAndUpdateSellerPositions: function () {
       o_pageBase.timerId = setInterval(function () {
          o_pageBase.getUserCoordinates();
          let a_data = {
              lat: o_pageBase.userPositionLatitude,
              lng: o_pageBase.userPositionLongitude
          };
          $.ajax({
              url: '/Cart/GetAndUpdateLastSellerPositions',
              type: "POST",
              data: a_data,
              success: function (res) {
                  if (!res.Result) {
                      utilitiesBase.errorMessage(res.ErrorInfo);
     	 		  }
              },
              error: function () {
          
     	 	  }
          
          });
       }, 30000);
	},
    calculateProcent: function (dataValue, procentValue) {
        if (dataValue <= 0.0) {
            return 0.0;
        }
        if (procentValue <= 0.0) {
            return 0.0;
        }
        return ((dataValue / 100.0) * procentValue);
    },
    dateToClient: function (dateItem, doNotLocal) {
        try {
            if (!doNotLocal) {
                doNotLocal = false;
            }
            if (dateItem != null && dateItem != "") {
                if (doNotLocal) {
                    return moment.utc(dateItem).format("MM/DD/YYYY LT")
                } else {
                    return moment.utc(dateItem).local().format("MM/DD/YYYY LT")
                }

            } else {
                return "";
            }
        } catch (exp) {
            return dateItem;
        }
    },
    dateToClientAMPM: function (dateItem) {
        try {
            if (dateItem != null && dateItem != "") {
                return moment.utc(dateItem).local().format("LT");
            } else {
                return "";
            }
        } catch (exp) {
            return dateItem;
        }
    },
    isItemInArray: function (item, arrayData) {
        if (arrayData == null) {
            return false;
        }
        for (let i = 0; i < arrayData.length; i++) {
            if (arrayData[i] == item) {
                return true;
            }
        }
        return false;
    },
    random_rgba: function () {
        var o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
    },
    generatePaySystemObject: function () {
        return Stripe(o_pageBase.webSiteOpenPaySystemKey);
    },
    generatePayIntent: function (cardId, afterPayResultWork) {
        let lastComputedDistance = null;
        if (o_pageBase.lastComputedDistanceData != null &&
            o_pageBase.lastComputedDistanceData != undefined) {
            lastComputedDistance = o_pageBase.lastComputedDistanceData;
        }
        $.ajax({
            type: "POST",
            url: "StartPayIntentProducts",
            data: { generatedCardId: cardId, distanceInfo: lastComputedDistance },
            success: function (response) {
                afterPayResultWork(response);
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    generateTipsPayIntent: function (cardId, userId, sellerAccountId,
        amount, aboutWhatInfo, afterPayResultWork) {
        $.ajax({
            type: "POST",
            url: "SendTips",
            data: {
                generatedCardId: cardId, userId: userId,
                sellerAccountId: sellerAccountId,
                amount: amount, aboutWhatInfo: aboutWhatInfo
            },
            success: function (response) {
                afterPayResultWork(response);
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    сheckUserPaySystemInfo: function (afterCheck) {
        $.ajax({
            type: "POST",
            url: "CheckUserPaySystemInfo",
            success: function (response) {
                afterCheck(response);
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    lastComputedDistanceData: null,
    generatePayElementObject: function (cardElementId, mode, additionalData, onSuccess, onError,distanceData) {
        if (mode == undefined || mode == null) {
            mode = "pay";         
        }
        o_pageBase.lastComputedDistanceData = distanceData;
        o_pageBase.loader('show');
        o_pageBase.сheckUserPaySystemInfo(function (data) {
            if (data.Result) {
                let buildCard = true;
                let onNotInitLastCardMethod = function () {
                    try {

                        let stripe = Stripe(o_pageBase.webSiteOpenPaySystemKey);
                        let elements = stripe.elements();
                        let card = elements.create('card', {
                            style: {
                                base: {
                                    color: "#32325d",
                                    fontFamily: 'Arial, sans-serif',
                                    fontSmoothing: "antialiased",
                                    fontSize: "16px",
                                    "::placeholder": {
                                        color: "#32325d"
                                    }
                                },
                                invalid: {
                                    fontFamily: 'Arial, sans-serif',
                                    color: "#fa755a",
                                    iconColor: "#fa755a"
                                }
                            }
                        });
                        card.on("change", function (event) {
                            document.querySelector("button").disabled = event.empty;
                            document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
                        });
                        card.mount(cardElementId);
                        var form = document.getElementById("payment-form");
                        form.addEventListener("submit", function (event) {
                            event.preventDefault();
                            switch (mode) {
                                case "pay":
                                    o_pageBase.startPayIntent(stripe, card, data, onSuccess, onError);
                                    break;
                                case "tips":
                                    o_pageBase.startPayTipsIntent(stripe, card, data,
                                        additionalData.userId,
                                        additionalData.sellerAccountId, additionalData.amount,
                                        additionalData.aboutWhatInfo,
                                        onSuccess, onError);
                                    break;
                            }

                        }); 
                        if (data.CustomerId == null || data.LastCardNumber == null) {
                           $("#card-element-base").removeClass("d-none");
						}
                        o_pageBase.loader('hide');
                    } catch (exp) {
                        o_pageBase.loader('hide');
                        utilitiesBase.errorMessage('Connection with network lost, please reload page and try again');
                    }


                };
                if (data.CustomerId != null && data.LastCardNumber != null){
                    confirmUtilites.confirm('Use card', "We found previous used card with last number *******" + data.LastCardNumber + ". Use it again ?", 'success',
                        function () {
                            switch (mode) {
                                case "pay":

                                    o_pageBase.generatePayIntent("", function (data) {
                                        o_pageBase.loader('hide');
                                        if (!data.Result) {
                                            if (onError != null) {
                                                onError();
                                            }
                                            utilitiesBase.errorMessage("An error occurred while pay attempt: " + data.ErrorInfo);
                                        } else {
                                            o_pageBase.onPaySuccessWork();
                                            if (onSuccess != null) {
                                                onSuccess();
                                            }
                                            utilitiesBase.infoMessage("Paid successfully");
                                        }
                                    });
                                    break;
                                case "tips":
                                    o_pageBase.generateTipsPayIntent("",
                                        additionalData.userId,
                                        additionalData.sellerAccountId, additionalData.amount,
                                        additionalData.aboutWhatInfo,
                                        function (data) {
                                            o_pageBase.loader('hide');
                                            if (!data.Result) {
                                                if (onError != null) {
                                                    onError();
                                                }
                                                utilitiesBase.errorMessage("An error occurred while pay attempt: " + data.ErrorInfo);
                                            } else {
                                                if (onSuccess != null) {
                                                    onSuccess();
                                                }
                                                utilitiesBase.infoMessage("Tips send successfully");
                                            }
                                        }, function (data) {

                                        }
                                    );
                                    break;
                            }
                        },
                        function () {
                            onNotInitLastCardMethod();
                            $("#card-element-base").removeClass("d-none");
						}
                    );
                }
                else {
                    onNotInitLastCardMethod();
				}
            } else {
                utilitiesBase.errorMessage(data.ErrorInfo);
                o_pageBase.loader('hide');
            }
        });
    },
    onPaySuccessWork: function () {
        window.location.href = '/Cart/Orders';
    },
    onPayTipsSuccessWork: function () {

    },
    startPayIntent: function (stripe, card, userInfo, onSuccess, onError) {
        o_pageBase.loader('show');
        let ownerInfo = {
            owner: {
                name: userInfo.Name,
                email: userInfo.Email
            }
        };
        stripe.createSource(card, ownerInfo).then(function (result) {
            if (result.error) {
                o_pageBase.loader('hide');
                if (onError != null) {
                    onError();
                }
                utilitiesBase.errorMessage("An error occurred while pay attempt: " + result.error.message);
            } else {
                // Send the token to your server.
                o_pageBase.generatePayIntent(result.source.id, function (data) {
                    o_pageBase.loader('hide');
                    if (!data.Result) {
                        utilitiesBase.errorMessage("An error occurred while pay attempt: " + data.ErrorInfo);
                        if (onError != null) {
                            onError();
                        }
                    } else {
                        o_pageBase.onPaySuccessWork();
                        if (onSuccess != null) {
                            onSuccess();
                        }
                        utilitiesBase.infoMessage("Paid successfully");
                    }
                });
            }

        });

    },
    startPayTipsIntent: function (stripe, card, userInfo, userId, sellerAccountId,
        amount, aboutWhatInfo, onSuccess, onError) {
        o_pageBase.loader('show');
        let ownerInfo = {
            owner: {
                name: userInfo.Name,
                email: userInfo.Email
            }
        };
        stripe.createSource(card, ownerInfo).then(function (result) {
            if (result.error) {
                o_pageBase.loader('hide');
                if (onError != null) {
                    onError();
                }
                utilitiesBase.errorMessage("An error occurred while pay attempt: " + result.error.message);
            } else {
                // Send the token to your server.
                o_pageBase.generateTipsPayIntent(result.source.id,
                    userId, sellerAccountId,
                    amount, aboutWhatInfo, function (data) {
                        o_pageBase.loader('hide');
                        if (!data.Result) {
                            if (onError != null) {
                                onError();
                            }
                            utilitiesBase.errorMessage("An error occurred while pay attempt: " + data.ErrorInfo);
                        } else {
                            if (onSuccess != null) {
                                onSuccess();
                            }
                            utilitiesBase.infoMessage("Tips send successfully");
                        }
                    });
            }

        });
    },
    webSiteRecaptchaOpenKey: '6Lc2MgMaAAAAAPD9ekIqpD7Igdp0NEpzy2UPeBKA',
    webSiteOpenPaySystemKey: 'pk_test_51HgY1hHAsX9r4Msvh1sQAEOHY5fvD3M7e7r4l9xZAj9CBFwb5eaQemDZ7v7sPzGdp4N7eVc13xdkXKXioh1NoVoc00x72mzHNF',
    /** Метод выхода пользователя из системы. */
    logout: function () {
        toastr.options = {
            "positionClass": "md-toast-bottom-right"
        }

        o_pageBase.makeActivePage();

        $.ajax({
            type: "POST",
            url: "/Account/LogoutUser",
            success: function () {
                window.location.href = "/";
            },
            error: function (req, status, error) { }
        });
    },
    makeActivePage: function () {
        let currentClass = $(document).find('.currenPageType').attr('data-current-type');
        if (currentClass != null) {
            $("#MainMenuNavBar").find("." + currentClass).toggleClass("active");
        }
    },
    /**
     * Метод отображения пагинации
     * @param {any} currentPage Текущая страница
     * @param {any} totalPage Количество страниц
     */
    loadPagination: function (currentPage, totalPage) {
        let html_nav = '<nav><ul class="pagination pg-blue pagination-circle js-nav-page-box my-2"></ul></nav>',
            html_tmp = '';

        $('.js-pagination').append(html_nav);

        for (var k = 0; k < totalPage; k++) {
            if (k == 0) {
                html_tmp += '<li class="page-item">' +
                    '<a class="page-link js-nav-item" href="#" aria-label="Previous" attr-id="' + (k + 1) + '">' +
                    '<span aria-hidden="true">&laquo;</span>' +
                    '<span class="sr-only">Previous</span></a></li>';
            }

            if (k + 1 == currentPage) {
                html_tmp += '<li class="page-item active"><a class="page-link waves-effect waves-effect" href="#" attr-id="' + (k + 1) + '">' + (k + 1) + ' <span class="sr-only">(current)</span></a></li>';
            }
            else {
                if (currentPage > 9) {
                    if ((k >= currentPage - 2 && k <= currentPage + 7) && (k != totalPage - 1)) {
                        html_tmp += '<li class="page-item"><a class="page-link js-nav-item" href="#" attr-id="' + (k + 1) + '">' + (k + 1) + '</a></li>';
                    }
                    else {
                        if (k == totalPage - 1) {
                            html_tmp += '<li class="page-item">...</li>';
                        }
                        else
                            continue;
                    }
                }
                else {
                    if ((k > 9) && (k != totalPage - 1))
                        continue;
                    else {
                        if (k == totalPage - 1)
                            html_tmp += '<li class="page-item">...</li>';

                        html_tmp += '<li class="page-item"><a class="page-link js-nav-item" href="#" attr-id="' + (k + 1) + '">' + (k + 1) + '</a></li>';
                    }
				}
            }

            if (k == totalPage - 1) {
                html_tmp += '<li class="page-item">' +
                    '<a class="page-link js-nav-item" href="#" aria-label="Next" attr-id="' + totalPage + '">' +
                    '<span aria-hidden="true">&raquo;</span>' +
                    '<span class="sr-only">Next</span></a></li>';
            }
        }
        $('.js-nav-page-box').append(html_tmp);
    },
    /** Стиль для таблицы */
    initStyleTable: function (s_table_id) {
        let jq_table = $('#' + s_table_id + '_wrapper'),
            jq_dt_filter = jq_table.find('.dataTables_filter'),
            jq_dt_length = jq_table.find('.dataTables_length'),
            jq_search = jq_dt_filter.find('input[type="search"]');

        jq_dt_length.closest('.col-sm-12.col-md-6').addClass('d-none');
        jq_dt_filter.closest('.col-sm-12.col-md-6').addClass('d-none');

        // Добавление кнопки поиска.
        jq_search.off();
        jq_search.on("keydown", function (evt) {
            if (evt.keyCode == 13) {
                $('#' + s_table_id).DataTable().search($("input[type='search']").val()).draw();
            }
        });
        $('#' + s_table_id + '-btn_search').button().on("click", function () {
            $('#' + s_table_id).DataTable().search($("input[type='search']").val()).draw();

        });
    },
    loadCartItemCount: function () {
        let basketId = helperFunc.getCache("_basket");
        $.ajax({
            type: "GET",
            url: "/Cart/LoadCartItemCount",
            data: { basketId: basketId },
            success: function (res) {
                let int = 20; //Здесь менять максимальное число элементов.
                if (res === undefined || res === null || res === "" || res <= 0) {
                    $('#badge-cart').text("");
                } else if (res > int) {
                    $('#badge-cart').text(int + "+");
                } else {
                    $('#badge-cart').text(res);
                }
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    /** Метод получения количества непрочитанных */
    loadMessageCount: function () {
        if ($('.js-nav-message').length == 0)
            return;

        $.ajax({
            type: "GET",
            url: "/Account/GetCountUnreadMessages",
            success: function (res) {
                let jq_count_msg = $('.js-nav-msg-count');
                let int = 99; //Здесь менять максимальное число элементов.
                if (res <= int && res > 0)
                    jq_count_msg.text(res);
                else if (res > int) jq_count_msg.text(int + "+");
                /*else
                    jq_count_msg.text(0);*/
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    riseChangeSalesCount: function () {
        $(document).trigger("salesCountChangedEvent", {});
    },
    /** Метод получения кол-во новых заказов */
    loadSalesCount: function () {
        $.ajax({
            type: "POST",
            url: "/Cart/GetSellerNewOrderCountInfo",
            success: function (res) {
                if (res != null) {
                    let jq_count_order = $('.js-nav-order-count'),
                        s_class = '';

                    switch (res.Status) {
                        case 0: s_class = 'bg-success'; break;
                        case 1: s_class = 'bg-warning'; break;
                        case 2: s_class = 'bg-danger'; break;
                    };

                    if (res.OrderCount > 0) {
                        jq_count_order.text(res.OrderCount);
                        jq_count_order.addClass(s_class);
                    }
                }
            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        });
    },
    loader: function (s_state) {
        let jq_loader = $('.container-preloader');
        if (s_state == 'show')
            jq_loader.show();
        else
            jq_loader.hide();
    },
    /** Метод получения страны пользователя */
    loadLocationCountry: function () {
        let s_country = helperFunc.getCache('location_city');
        if (s_country == null) {
            o_pageBase.setLocationData();
        }
        else {
            $('.js-location-city').html(s_country);
        }
    },
    updateUserAdressFromLocation: function (address1, address2, city, stateName, zipCode) {
        o_pageBase.loader('show');
        $.ajax({
            url: '/Account/UpdateUserAdressFromLocation',
            type: "POST",
            data: { Address1: address1, Address2: address2, City: city, StateName: stateName, ZipCode: zipCode },
            success: function (response) {
                o_pageBase.loader('hide');
                if (!response.Result) {
                    utilitiesBase.errorMessage(response.ErrorInfo);
                } else {
                    $(".detect-location-maps-save").hide();
                    $(".choose-main-location").modal("hide");       
                }
            }, error: function () { }
        });         
    },
    setLocationData: function () {
        $.getJSON('https://ipapi.co/json/', function (data) {
            o_pageBase.setLocationBase(data.city);             
        });
    },
    setLocationBase: function (city) {
        if (city != "" && city != null) {
            helperFunc.setCache('location_city', city);
            $('.js-location-city').html(city);
        }
    },
    setLocationDataFromMaps: function (city) {
        o_pageBase.setLocationBase(city);
    },
    getUserName: function () {
        o_pageBase.s_userName = '';
        if ($('.js-current-user-name').val() != null)
            o_pageBase.s_userName = $('.js-current-user-name').val();
    },
    /**
     * Метод установки данных для диалога в кеш
     * @param {string} _sellerId Код пользователя
     * @param {string} _productId Код товара
     */
    setCookieDialogRedirect: function (_sellerId, _productId, _supportId) {
        helperFunc.setCache('o_data_message_' + o_pageBase.s_userName, {
            productId: _productId,
            sellerId: _sellerId,
            supportId: _supportId
        });
    },
    /** Метод удаления данных диалога в кеш */
    removeCookieDialogRedirect: function () {
        helperFunc.setCache('o_data_message_' + o_pageBase.s_userName, null);
    }
}

var confirmUtilites = {
    /**
     * Метод вызова модального окна confirm
     * @param {string} s_title Заголовок
     * @param {string} s_desc Описание
     * @param {any} callbackBtnOk Функция возврата для кнопки Ok
     * @param {any} callbackBtnCancel Функция возврата для кнопки Cancel
     */
    confirm: function (s_title, s_desc, s_type, callbackBtnOk, callbackBtnCancel) {
        if (!$.confirm) {
            alert("Confirm library is not included in project!");
            return;
        }      
        let o_confirm = $.confirm({
            title: s_title,
            content: s_desc,
            typeAnimated: true,
            buttons: {
                ok: {
                    btnClass: 'btn btn-info',
                    action: function () {
                        if (callbackBtnOk)
                            callbackBtnOk();
                    }
                },
                cancel: {
                    btnClass: 'btn btn-light',
                    action: function () {
                        if (callbackBtnCancel)
                            callbackBtnCancel();
                    }
                }
            }
        });

        switch (s_type) {
            case 'danger': {
                o_confirm.icon = 'fas fa-exclamation';
                o_confirm.type = 'red';
                o_confirm.buttons.ok.btnClass = 'btn btn-danger';

                break;
            }
            case 'success': {
                o_confirm.icon = 'fas fa-check';
                o_confirm.type = 'green';
                o_confirm.buttons.ok.btnClass = 'btn btn-success';

                break;
            }
        }
    }
};

var utilitiesBase = {
    isFilesPluginInit: false,
    minImageSize: 400,
    errorMessage: function (message) {
        toastr["error"]("An error occurred: " + message);
    },
    infoMessage: function (message) {
        toastr["info"](message);
    },
    warningMessage: function (message) {
        toastr["warning"](message);
    },
    validateForm: function (parentForm) {
        let res = true;
        if (parentForm != null && $(parentForm).length > 0) {
            res = utilitiesBase.validateFromParent($(parentForm));
        } else {
            res = utilitiesBase.validateFromParent($(document));
        }
        if (!res) {
            $('[data-toggle="tooltip"]').tooltip();
            toastr["warning"]("Not all fields are filled in correctly, please check the form");
        }
        return res;
    },
    validateFromParent: function (parentContainer) {
        let anyError = false;
        $(parentContainer).find('.validate').each(function () {
            if ($(this).attr('required') != null) {
                let isValid = utilitiesBase.validateRequired($(this));
                if (!isValid) {
                    anyError = true;
                }
            }
        });
        return !anyError;
    },
    validateRequired: function (parentElement) {
        if ($(parentElement) != null && $(parentElement).length > 0) {
            if ($(parentElement).val() == "") {
                utilitiesBase.validateError($(parentElement));
                return false;
            } else {
                utilitiesBase.validateSuccess($(parentElement));
                return true;
            }
        } else {
            return true;
        }
    },
    validateError: function (parentElement) {
        if ($(parentElement) != null && $(parentElement).length > 0) {
            $(parentElement).removeClass("is-valid").addClass("is-invalid");

        } else {

        }

    },
    validateSuccess: function (parentElement) {
        if ($(parentElement) != null && $(parentElement).length > 0) {
            $(parentElement).removeClass("is-invalid").addClass("is-valid");
        }
    },
    getRandomIntInclusive: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
    },
    convertUrl: function (url) {

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return (match && match[2].length === 11)
            ? match[2]
            : null;
    },
    generateVideoYoutube: function (url, specId) {
        if (specId == undefined || specId == null) {
            specId = "";
        }
        let videoId = utilitiesBase.convertUrl(url);
        let iframeMarkup = '<iframe ' + (specId != "" ? 'id="' + specId + '"' : "") + '  src="http://www.youtube.com/embed/' + videoId +
            '?enablejsapi=1" frameborder="0" allowfullscreen></iframe>';
        return iframeMarkup;
    },
    isAuthenticated: function () {
        return $("#IsAuthenticated").length > 0;
    },
   
    isFilesAddedToObject: function (objectInstance) {
        try {
            let files = $(objectInstance).filepond("getFiles");
            return files != null && files.length;
        } catch (exp) {
            return false;
        }
    },
    countFilesOfObject: function (objectInstance) {
        try {
            let files = $(objectInstance).filepond("getFiles");
            return files.length;
        } catch (exp) {
            return 0;
        }
    },
    clearFilesOfObject: function (objectInstance) {
        try {
            let files = $(objectInstance).filepond("getFiles");
            if (files != null) {
                for (let i = 0; i < files.length; i++) {
                    $(objectInstance).filepond("removeFile", files[i].id);
                }
            }
        } catch (exp) {

        }
    },
    fillFilesOfObject: function (objectInstance, fileList) {
        
        utilitiesBase.clearFilesOfObject(objectInstance);
        if (fileList == null)
            return;

        for (let i = 0; i < fileList.length; i++) {
            let formattedUrl = '/Reference/GetFile?Id=' + fileList[i].Id;
            $(objectInstance).filepond('addFile', formattedUrl, {
                index: i 
            }).then(data => {
                utilitiesBase._setAdditionalMetadataToFileOnAdd(data, "1");                
            });            
        }
         
        objectInstance.attr("stateChanged", "0");
    },
    _setAdditionalMetadataToFileOnAdd: function (data,value) {
        data.setMetadata('isCropped', value);  
    },
    generateFormDataWithFiles: function (objectInstance) {
        let files =  $(objectInstance).filepond("getFiles")
        let formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            if (files[i].file instanceof Blob) {
                formData.append("files", new File([files[i].file], files[i].file.name));
            } else {
                formData.append("files", files[i].file);
            }
         }
        return formData; 
    },

    checkIsFilesCropped: function (objectInstance) {
         
        let files = $(objectInstance).filepond("getFiles")
        let formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            let data = files[i].getMetadata();
            if (data == null || data.isCropped != "1") {
                return false;
            }
        }
        return true;
    },
    generateFormDataWithFilesSimple: function (inputId) {
        var input = document.getElementById(inputId);
        var files = input.files;
        return files;
    },
    isFilesChanged: function (objectInstance) {
        if (objectInstance == null || objectInstance == undefined) {
            return false;
        }
        return objectInstance.attr("stateChanged") == "1";
    },    
    initFileUpload: function (objectInstance, allowEdit, allowMultiple,allowRound) {
        if (allowMultiple == undefined || allowMultiple == null) {
            allowMultiple = true;
        }
        if (!utilitiesBase.isFilesPluginInit) {
            FilePond.registerPlugin(FilePondPluginFileValidateSize);
            FilePond.registerPlugin(FilePondPluginImageExifOrientation);
            FilePond.registerPlugin(FilePondPluginImagePreview);
            FilePond.registerPlugin(FilePondPluginImageCrop);
            FilePond.registerPlugin(FilePondPluginImageResize);
            FilePond.registerPlugin(FilePondPluginImageTransform); 
            FilePond.registerPlugin(FilePondPluginImageEdit);
      
            
            utilitiesBase.isFilesPluginInit = true;
        }       
        let bindEditor = null;
        let filePond = null;
        if (allowEdit == true) {
            var cropper = null;
            bindEditor = { 
                open: (file, instructions) => { 
                    $(document).find('body').append($('<div class="windowForEditImageSizeParent"> <div class="modal fade right" id="windowForEditImageSize" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                        '<div class="modal-dialog modal-lg modal-top" role="document">' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<h4 class="modal-title w-100" id="myModalLabel">Change size of image</h4>' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span>' +
                        '</button>' +
                        '</div>' + 
                        '<div class="modal-body">' + 
                        "<div class='row js-image-change-size-window'  >" +  
                                    "<div class='col'>" +
                                        "<div class='js-image-change-size-window-content' style=''>" +
                                        "</div>" +
                                     "</div>" + 
                           '</div>' + 
                        '<div class="modal-footer justify-content-center">' +
                            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
                            '<button type="button" class="btn btn-primary js-image-change-size-popup">Save changes</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' + '</div>')); 
                    $(".js-image-change-size-popup").click(function () {
                        /* Constants. */
                        const canvasData = cropper.getCanvasData() // Cropperjs method getCanvasData()
                        const cropData = cropper.getData() // Cropperjs method getData()

                        /* Ratio of selected crop area. */
                        const cropAreaRatio = cropData.height / cropData.width

                        /* Center point of crop area in percent. */
                        const percentX = (cropData.x + cropData.width / 2) / canvasData.naturalWidth
                        const percentY = (cropData.y + cropData.height / 2) / canvasData.naturalHeight

                        /* Calculate available space round image center position. */
                        const cx = percentX > 0.5 ? 1 - percentX : percentX
                        const cy = percentY > 0.5 ? 1 - percentY : percentY

                        /* Calculate image rectangle respecting space round image from crop area. */
                        let width = canvasData.naturalWidth;
                        let height = width * cropAreaRatio;
                        if (height > canvasData.naturalHeight) {
                            height = canvasData.naturalHeight
                            width = height / cropAreaRatio
                        }
                        const rectWidth = cx * 2 * width
                        const rectHeight = cy * 2 * height
                        const zoom = Math.max(rectWidth / cropData.width, rectHeight / cropData.height)
                        let canvas = cropper.getCroppedCanvas();
                        if (canvas.width < utilitiesBase.minImageSize ||
                            canvas.height < utilitiesBase.minImageSize) {
                            utilitiesBase.errorMessage("Image width and height can not be less then 400 px, please realod or crope bigger image");
                            return false;
                        }

                        bindEditor.onconfirm({
                            data: {
                                crop: {
                                    center: {
                                        x: percentX,
                                        y: percentY
                                    },
                                    flip: {
                                        horizontal: 0,
                                        vertical: 0

                                    },
                                    zoom: zoom,
                                    rotation: 0,
                                    aspectRatio: cropAreaRatio
                                }
                            }
                        });
                        $("#windowForEditImageSize").modal("hide");
                       
                      
                    });
                    $('#windowForEditImageSize').unbind('shown.bs.modal');
                    $('#windowForEditImageSize').unbind('hide.bs.modal');
                    
                    $('#windowForEditImageSize').on('hide.bs.modal', function () {
                        if (cropper != null) {
                            cropper.destroy();
                            cropper = null;
                        }
                        $(".windowForEditImageSizeParent").remove(); 
                    });
                    $('#windowForEditImageSize').on('shown.bs.modal', function () { 
                        let image = new Image();
                        image.src = URL.createObjectURL(file); 
                       
                        $(".js-image-change-size-window-content").html(image);
                        $(".js-image-change-size-window-content").find('img').css('height', '100%');
                        $(".js-image-change-size-window-content").find('img').css('width', '100%');
                        cropper = new Cropper(image, {
                            aspectRatio: 1,
                            rotatable: false,
                            scalable: true,
                            zoomable: true,
                            zoomOnTouch: false,
                            cropBoxResizable: true,
                            viewMode: 3,  
                            crop: function (event) { 
                            }
                        });
                    }); 
                    $("#windowForEditImageSize").modal("show"); 
                }, 
                onconfirm: (output, item) => {
                    let canvas = cropper.getCroppedCanvas();
                   
                    canvas.toBlob(function (blob) {
                        let id = item.id;
                        blob.lastModifiedDate = new Date();
                        blob.isCropped = true;
                        blob.name = item.file.name;
                        $(objectInstance).filepond('removeFile', item);
                        $(objectInstance).filepond('addFile', blob).then(data => {
                            utilitiesBase._setAdditionalMetadataToFileOnAdd(data, "1");
                        });
                    });
                    if (cropper != null) {
                        cropper.destroy();
                        cropper = null;
                    }
                  
                },

                // Callback set by FilePond
                // - should be called by the editor when user cancels editing
                oncancel: () => { },

                // Callback set by FilePond
                // - should be called by the editor when user closes the editor
                onclose: () => { }
            };
        }
     
        $(objectInstance).filepond({
            allowMultiple: allowMultiple,
            allowReorder:true,
            instantUpload: false,
            allowImageEdit: true,
            stylePanelLayout: (allowRound == true ? 'compact circle' : null),
            imageEditEditor: bindEditor,
            oninitfile: function (file) {
                objectInstance.attr("stateChanged", "1");
            }
        });
    
 
    },
    attachFilesToParent: function (parentId, parentType, filesContainerInstance,runAfterFilesDone) {
        let objectSend = utilitiesBase.generateFormDataWithFiles(filesContainerInstance);
        objectSend.append("id", parentId);
        objectSend.append("parentType", parentType);

        $.ajax({
            type: "POST",
            url: "/Reference/AddFiles",
            processData: false,
            contentType: false,
            data: objectSend,
            success: function (res) {
                if (res.Result) {
                    //utilitiesBase.infoMessage("Files added successfully!");
                    let data = { Result: res.Result, parentId: parentId, parentType: parentType, Error: "" };
                    $(document).trigger("filesDone", data);
                    if (runAfterFilesDone != null) {
                        runAfterFilesDone(data);
                    }
                    
                } else {
                    let data = { Result: res.Result, parentId: parentId, parentType: parentType, Error: res.ErrorInfo };
                    $(document).trigger("filesDone", data);
                    if (runAfterFilesDone != null) {
                        runAfterFilesDone(data);
                    }
                    utilitiesBase.errorMessage(res.ErrorInfo);
                }

            },
            error: function (req, status, error) {
                utilitiesBase.errorMessage("An error occurred: " + error);
            }
        })
    },
    newGuid: function () {
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        for (var i = 0; i < 32; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[12] = "4";
        s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);
        var uuid = s.join("");
        return uuid;
    },
    isInt: function (n) {
        return Number(n) === n && n % 1 === 0;
    }, 
    isFloat: function (n) {
        return Number(n) === n && n % 1 !== 0;
    },
    convertToFloat: function (value) {
        try {
            let test = parseFloat(value);
         
            return test;
        } catch (exp) {
            return 0;
        } 
    },
    mileToKilometr: function (mile) {
        return mile / 1.60934;
    },
    mileToMeters: function (mile) {
        return utilitiesBase.mileToKilometr(mile) * 1000;
    }
}

var mapsUtilities = {
    mapsFullyLoadedScript:false,
    isMapCurrentUserLocationInit: false,
    isAutoCompletePlaceChangedInit:false,    
    apiKey:"AIzaSyC0HodK4DClQwsmNkcx-oJr6M0x2xJvWmM",
    infoWindow: null,
    markers: [],
    milesRadius: 20,  
    useRadiusMarkers:true,
    multipleMarkers: false,
    geocoder: null,
    distanceMatrix: null,
    changeAddressInLocationSelect: function () {
        $(".detect-location-maps-save").removeClass("d-none");        
    },
    calculateDistance: function (startCoords, endCoords,onCalculated) {

        mapsUtilities.distanceMatrix.getDistanceMatrix({
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            travelMode:"DRIVING",
            origins: [startCoords.lat + "," + endCoords.lng],
            destinations: [endCoords.lat + "," + endCoords.lng],
        }, function (res) {
                let shortesWay =-1.0;
                for (let row in res.rows) {
                    for (let element in res.rows[row].elements) {
                        let elementValue = res.rows[row].elements[element];
                        if (elementValue.status == "OK") {
                            let calcValue = elementValue.distance.value / 5280.0;
                            if (shortesWay == -1.0 || calcValue < shortesWay) {
                                shortesWay = calcValue;
                            }
                        }
                    }
                }
                if (shortesWay < 0) {
                    shortesWay = 0.0;
                } else {
                    shortesWay = Math.round((shortesWay + Number.EPSILON) * 100) / 100
                }
                onCalculated(shortesWay);
        });
       
    },
    markerOnClickEnable: function (map, doNotUseRadius, useSingleMarker, convertPosToAdress) {
        google.maps.event.addDomListener(
            map,
            'click',
            function (event) { mapsUtilities.createMarker(map, { lat: event.latLng.lat(), lng: event.latLng.lng() }, null, null, null, null, null, doNotUseRadius, useSingleMarker, convertPosToAdress); }
        );
      
    },
    getItemFromAddressComponent: function (address_components, type) {
        if (address_components == null) {
            return "";
        }
        for (let n in address_components) {
            if (address_components[n].types != null && address_components[n].types.indexOf(type)!=-1) {
                if (address_components[n].long_name == "Unnamed Road") {
                    return "";
                } else {
                    return address_components[n].long_name;
                }                
            }
        }
        return "";
    },
    convertToStringAdress: function (elementAdress) {
        if (elementAdress == null) {
            return "";
        }
        let formatted = "";
        if (elementAdress.Address1 != null && elementAdress.Address1 != "") {
            formatted = elementAdress.Address1;
        }
        if (elementAdress.Address2!= null && elementAdress.Address2 != "") {
            formatted += (formatted==""?"":", ")+ elementAdress.Address2;
        }
        if (elementAdress.City != null && elementAdress.City != "") {
            formatted += (formatted == "" ? "" : ", ") + elementAdress.City;
        }
        if (elementAdress.StateName != null && elementAdress.StateName != "") {
            formatted += (formatted == "" ? "" : ", ") + elementAdress.StateName;
        }
        if (elementAdress.ZipCode != null && elementAdress.ZipCode != "") {
            formatted += (formatted == "" ? "" : " ") + elementAdress.ZipCode;
        }
        return formatted;
    },
    parseAdressFromGeoCoding: function (row) {
        if (row != null) {
            if (row.address_components.length > 0) {
             
                let formattedElement = {
                    Address1: mapsUtilities.getItemFromAddressComponent(row.address_components, "route"),
                    Address2: mapsUtilities.getItemFromAddressComponent(row.address_components, "street_number"),
                    City: mapsUtilities.getItemFromAddressComponent(row.address_components, "locality"),
                    ZipCode: mapsUtilities.getItemFromAddressComponent(row.address_components, "postal_code"),
                    StateName: mapsUtilities.getItemFromAddressComponent(row.address_components, "administrative_area_level_1"),
                }
                return formattedElement;                 
            }
        }
        return null;
    },
    createMarker: function (map, coord, customRadius, customTitle, clickEventHandler, generateRandomColor, doNotRiseChanges, doNotUseRadius, useSingleMarker, convertPosToAdress, userOrProduct) {
        
        mapsUtilities.waitUntilMapsLoaded(function () {            
            if (!map) {
                return;
            }
            if (!mapsUtilities.multipleMarkers || (useSingleMarker == true)) {
                mapsUtilities.clearMarkers(map);
            }
            if (generateRandomColor == undefined) {
                generateRandomColor = false;
            }           
            let _icon = {
                url: '/img/site/pixel_cookie.png',
                scaledSize: new google.maps.Size(35, 35),
            };
            let base_icon = {
                url: '/img/site/base-marker.png',
                scaledSize: new google.maps.Size(35, 45),
			}

            var pos = new google.maps.LatLng(coord.lat, coord.lng);
            let posMarker = new google.maps.Marker({
                position: pos,
                map: map,
                //icon: _icon,
                icon: (userOrProduct == true) ? base_icon : _icon,
                title: (customTitle == undefined || customTitle == null ? "Position" : customTitle)
            });
            if (clickEventHandler != null && clickEventHandler != undefined) {
                posMarker.addListener("click", () => {
                    clickEventHandler();
                });
            }
            if (mapsUtilities.markers[map.Id] == null) {
                mapsUtilities.markers[map.Id] = [];
            }
            if (mapsUtilities.useRadiusMarkers && (doNotUseRadius != true)) {
                let markerRadius = new google.maps.Circle({
                    center: pos,
                    map: map,
                    strokeColor: '#000',
                    strokeWeight: 2,
                    strokeOpacity: 0.5,
                    fillColor: generateRandomColor ? o_pageBase.random_rgba() : '#007bff',
                    fillOpacity: 0.8,
                    radius: mapsUtilities.formatRadiusFromMiles(customRadius != undefined && customRadius != null ? customRadius : mapsUtilities.milesRadius)
                });
                
                mapsUtilities.markers[map.Id].push({ pointMarker: posMarker, radiusMarker: markerRadius });
            } else {
                mapsUtilities.markers[map.Id].push({ pointMarker: posMarker });
            }
            if (doNotRiseChanges != true) {
                $(document).trigger("markerAddedOnMap", {
                    marker: mapsUtilities.formatPointCoordinatedPosition(posMarker)
                });
                if (convertPosToAdress == true) {
                    mapsUtilities.getCoordinatesFromGPS(map, pos, false)
                }
            }
        });
        
    },
    formatRadiusFromMiles: function (mile) {
        return utilitiesBase.mileToMeters(mile);
    },
    updateMarkersRadius: function (map) {
        if (mapsUtilities.markers[map.Id] != null) {
            for (let i = 0; i < mapsUtilities.markers[map.Id].length; i++) {
                if (mapsUtilities.markers[map.Id][i].radiusMarker) {
                    mapsUtilities.markers[map.Id][i].radiusMarker.setRadius(mapsUtilities.formatRadiusFromMiles(mapsUtilities.milesRadius));
                }
            }
        }
    },
    formatPointCoordinatedPosition: function (googlePosition) {
        if (googlePosition == null) {
            return { lat: 0, lng: 0}; 
        }
        return { lat: googlePosition.position.lat(), lng: googlePosition.position.lng() };
    },
    getLastPointCoordinates: function (map) {
        if (mapsUtilities.markers[map.Id] == null) {
            return null;
        }
        if (mapsUtilities.markers[map.Id].length == 0) {
            return null;
        } else {
            let FindedData = mapsUtilities.markers[map.Id][mapsUtilities.markers[map.Id].length - 1];
            if (FindedData.pointMarker != null) {
                return { lat: FindedData.pointMarker.position.lat(), lng: FindedData.pointMarker.position.lng() };
            } else {
                return null;
            } 
        }
    },
    setMapOnAllMarkers: function (map,toMap) {
        if (map == null) {
            return;
        }
        if (mapsUtilities.markers[map.Id] == null) {
            return;
        }
 
        for (let i = 0; i < mapsUtilities.markers[map.Id].length; i++) {
            mapsUtilities.markers[map.Id][i].pointMarker.setMap(toMap);
            if (mapsUtilities.markers[map.Id][i].radiusMarker) {
                mapsUtilities.markers[map.Id][i].radiusMarker.setMap(toMap);
            }
        }
    },
    clearMarkers: function (map) {
        mapsUtilities.setMapOnAllMarkers(map, null);
        if (map != null) {
            mapsUtilities.markers[map.Id] = [];
        }
    },
    getCurrentPosition: function (positionHandler,errorHandler) {
        if (navigator.geolocation) {             
            navigator.geolocation.getCurrentPosition(positionHandler, errorHandler);
        } else {
            errorHandler({ code:"-1", message:"We can not getWe can not get Yours coordinates, please give access to Yours location" })
        }
    },
    formatAdress: function (adress1, adress2, city, zipCode) {
        let fullAdress = adress1;
        fullAdress += (!adress2 ? "" : " " + adress2) +
            (!city ? "" : " " + city);
        return fullAdress;
    },
    getCoordinatesFromAdress: function (map,address, useWithMap, onSuccess, onError, userOrProduct) {
        if (mapsUtilities.geocoder == null || mapsUtilities.geocoder == undefined) {
            onError("Maps was not initialized");
            return;
        }
        mapsUtilities.geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == 'OK') {
                if (useWithMap) {
                    map.setCenter(results[0].geometry.location);
                    mapsUtilities.createMarker(map,{
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    }, null, null, null, null, true, true, false, false, userOrProduct);
                }
                if (onSuccess) {
                    onSuccess({ lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() })
                }
            } else {
                if (onError) {
                    onError();
                }
            }
        });
    },
    getCoordinatesFromGPS: function (map, location, useWithMap, onSuccess, onError) {
        if (mapsUtilities.geocoder == null || mapsUtilities.geocoder == undefined) {
            onError("Maps was not initialized");
            return;
        }
        mapsUtilities.geocoder.geocode({ location : location }, function (results, status) {
            if (status == 'OK') {
                if (useWithMap) {
                    map.setCenter(results[0].geometry.location);
                    mapsUtilities.createMarker(map, {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    }, null, null, null, null, true);
                }
                let loadedData = mapsUtilities.formatGeneratedAdressData(results[0].geometry.location.lat(),
                    results[0].geometry.location.lng(), mapsUtilities.parseAdressFromGeoCoding(results[0]));                     
                if (onSuccess) {
                    onSuccess(loadedData);
                }
                $(document).trigger("mapAddressParsedFromLocation", loadedData);
            } else {
                if (onError) {
                    onError();
                }
            }
        });
    },
    
    formatGeneratedAdressData: function (lat, lng, address) {
        return {
            lat: lat,
            lng: lng,
            convertedAdress: address
        };
    },
    waitUntilMapsLoaded: function (callback) {
        if (mapsUtilities.mapsFullyLoadedScript) {
            callback();
        } else {
            setTimeout(function () {
                mapsUtilities.waitUntilMapsLoaded(callback);
            }, 100);
        }
    },
    mapAutoCompleteInit: function (input,map) {
        mapsUtilities.waitUntilMapsLoaded(function () {
            try {
                const center = mapsUtilities.getLastPointCoordinates(map);
                // Create a bounding box with sides ~10km away from the center point
                const defaultBounds = center == null
                    ? null : {
                        north: center.lat + 0.1,
                        south: center.lat - 0.1,
                        east: center.lng + 0.1,
                        west: center.lng - 0.1,
                    };

                const options = {
                    bounds: defaultBounds,
                    //componentRestrictions: { country: "us" },
                    fields: ["address_components", "geometry", "icon", "name"],
                    origin: center,
                    strictBounds: false,
                    types: ["establishment"],
                };
                let autocomplete = new google.maps.places.Autocomplete(input[0], options);
                if (!mapsUtilities.isAutoCompletePlaceChangedInit) {
                    google.maps.event.addListener(autocomplete, 'place_changed', function () {
                        let place = autocomplete.getPlace();
                        if (place.geometry != null) { 
                            
                            if (map.allowMarkerOnClick == true) {
                                let coord = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                                map.setCenter(coord);
                                mapsUtilities.createMarker(map, coord, null, null, null, null, null, map.doNotUseRadius, map.useSingleMarker, map.convertPosToAdress);
                            } 
                        }
                        $(document).trigger("mapAddressParsedFromLocation", mapsUtilities.
                            formatGeneratedAdressData(null,
                                null, mapsUtilities.parseAdressFromGeoCoding(place)));
                    });
                    mapsUtilities.isAutoCompletePlaceChangedInit = true;
                }
            } catch (exp) {

            }
        });
       
    },
    mapInit: function (mapId, allowMarkerOnClick, lat, lng, doNotUseRadius, useSingleMarker,convertPosToAdress,mapLoadedCallback) {
        mapsUtilities.waitUntilMapsLoaded(function () {
            if (!lat) {
                lat = -34.397;
            }
            if (!lng) {
                lng = 150.644;
            }
            if (mapsUtilities.geocoder == null) {
                mapsUtilities.geocoder = new google.maps.Geocoder();
            }
            if (mapsUtilities.distanceMatrix == null) {
                mapsUtilities.distanceMatrix = new google.maps.DistanceMatrixService();
            }
            let map = null;
            map = new google.maps.Map(document.getElementById(mapId), {
                center: { lat: lat, lng: lng },
                zoom: 8,
                styles: [
                    {
                        "featureType": "administrative",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "on"
                            },
                            {
                                "lightness": 33
                            }
                        ]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [
                            {
                                "color": "#f2e5d4"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "color": "#c5dac6"
                            }
                        ]
                    },
                    {
                        "featureType": "poi.park",
                        "elementType": "labels",
                        "stylers": [
                            {
                                "visibility": "on"
                            },
                            {
                                "lightness": 20
                            }
                        ]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [
                            {
                                "lightness": 20
                            }
                        ]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "color": "#c5c6c6"
                            }
                        ]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "color": "#e4d7c6"
                            }
                        ]
                    },
                    {
                        "featureType": "road.local",
                        "elementType": "geometry",
                        "stylers": [
                            {
                                "color": "#fbfaf7"
                            }
                        ]
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [
                            {
                                "visibility": "on"
                            },
                            {
                                "color": "#acbcc9"
                            }
                        ]
                    }
                ]
            });
            map.Id = mapId;            
            map.doNotUseRadius = doNotUseRadius;
            map.useSingleMarker = useSingleMarker;
            map.convertPosToAdress = convertPosToAdress;
            map.allowMarkerOnClick = allowMarkerOnClick;
            
            if (allowMarkerOnClick == true) {
                mapsUtilities.markerOnClickEnable(map, doNotUseRadius, useSingleMarker, convertPosToAdress);
            }
            if (mapsUtilities.infoWindow == null) {
                mapsUtilities.infoWindow = new google.maps.InfoWindow();
            }
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        map.setCenter(pos);
                        if (allowMarkerOnClick == true) {
                            mapsUtilities.createMarker(map, pos, null, null, null, null, null, doNotUseRadius, useSingleMarker, convertPosToAdress);
                        }
                    },
                    () => {
                        mapsUtilities.handleLocationError(map, true, mapsUtilities.infoWindow, map.getCenter());
                    }
                );

            } else {  mapsUtilities.handleLocationError(map, false, infoWindow, map.getCenter());
            }
            if (mapLoadedCallback) {
                mapLoadedCallback(map);
            }
           
        });
      
       
         
        
    },
    handleLocationError: function (map,browserHasGeolocation, infoWindow, pos) {
        try {
            infoWindow.setPosition(pos);
            infoWindow.setContent(
                browserHasGeolocation
                    ? "Error: The Geolocation service failed."
                    : "Error: Your browser doesn't support geolocation."
            );
            infoWindow.open(map);
        } catch (exp) {

        }
     
    }
}

var maskUtilities = {
    initBaseMasks: function () {
        $('.mask-date').mask('00/00/0000');
        $('.mask-time').mask('00:00:00');
        $('.mask-time-en').mask('00:00 ZM', {
            translation: {
                'Z': {
                    pattern: /[apAP]/
                }
            }, 
            placeholder: "__:__ AM"
        });
        $('.mask-date_time').mask('00/00/0000 00:00:00');
        $('.mask-cep').mask('00000-000');
        $('.mask-phone').mask('0000-0000');
        $('.mask-phone_with_ddd').mask('(00) 0000-0000');
        $('.mask-phone_us').mask('(000) 000-0000');
        $('.mask-mixed').mask('AAA 000-S0S');
        $('.mask-cpf').mask('000.000.000-00', { reverse: true });
        $('.mask-cnpj').mask('00.000.000/0000-00', { reverse: true });
        $('.mask-money').mask('000.000.000.000.000,00', { reverse: true });
        $('.mask-money2').mask("#.##0,00", { reverse: true });
        $('.mask-ip_address').mask('0ZZ.0ZZ.0ZZ.0ZZ', {
            translation: {
                'Z': {
                    pattern: /[0-9]/, optional: true
                }
            }
        });
        $('.mask-ip_address').mask('099.099.099.099');
        $('.mask-percent').mask('##0.0%', { reverse: true });
        $('.mask-clear-if-not-match').mask("00/00/0000", { clearIfNotMatch: true });
        $('.mask-placeholder').mask("00/00/0000", { placeholder: "__/__/____" });
        $('.mask-fallback').mask("00r00r0000", {
            translation: {
                'r': {
                    pattern: /[\/]/,
                    fallback: '/'
                },
                placeholder: "__/__/____"
            }
        });
        $('.mask-selectonfocus').mask("00/00/0000", { selectOnFocus: true });
        $('.mask-float-positive').mask('999.99');
        $('.mask-float-max100').mask('999.99', { reverse: true });
        $('.mask-int').mask('000');
        $('.mask-int-days').mask('0', {
            translation: {
                '0': {
                    pattern: /[0-6]/, optional: true
                }
            }
        });
    }
}

var calendarSheduleUtilities = {
    daysOfWeek: [{ Name: "Sunday", Index: 0 }, { Name: "Monday", Index: 1 },
        { Name: "Tuesday", Index: 2 }, { Name: "Wednesday", Index: 3 },
        { Name: "Thursday", Index: 4 }, { Name: "Friday", Index: 5 },
        { Name: "Saturday", Index: 6 }],
    startTime: 7,
    endTime: 24,
    usePMFormat: true,
    notUsedTextDefault: "Not",
    usedTextDefault: "Work",
    isCommonControlsConfigured: false,
    lastSelectedParent: null,
    formatUSENTime: function (currenttime) {
        return moment(currenttime, 'h:mma').format("LT");
    },
    isDayOfWeekExistsInList: function (daysOfWeekGroupped, dayOfWeek) {
        for (let i = 0; i < daysOfWeekGroupped.length; i++) {
            if (daysOfWeekGroupped[i].dayOfWeek == dayOfWeek) {
                return daysOfWeekGroupped[i];
            }
        }
        return null;
    },
    formatConfigureItemUsingGroup: function (listOfTimes) {
        let daysOfWeekGroupped = [];
        for (let i = 0; i < listOfTimes.length; i++) {
            let daysOfWeeInItem = listOfTimes[i].DaysOfWeek;
            for (let j = 0; j < daysOfWeeInItem.length; j++) {
                let findedObject = null;
                let formattedStart = (calendarSheduleUtilities.formatUSENTime(o_pageBase.dateToClientAMPM(listOfTimes[i].StartTimeExisting)));
                let formattedEnd = (calendarSheduleUtilities.formatUSENTime(o_pageBase.dateToClientAMPM(listOfTimes[i].EndTimeExisting)));

                if ((findedObject = calendarSheduleUtilities.
                    isDayOfWeekExistsInList(daysOfWeekGroupped,
                    daysOfWeeInItem[j])) == null) {
                    daysOfWeekGroupped.push({
                        workTimes: [{ startTime: formattedStart, endTime: formattedEnd }],
                        dayOfWeek: daysOfWeeInItem[j]
                    });
                } else {
                    findedObject.workTimes.push({ startTime: formattedStart, endTime: formattedEnd });
                }
            }
        }
        return daysOfWeekGroupped;
    },
    formatConfigureItem: function (beginningTimeStr, endTimeStr, daysOfWeek) {
        let beginningTime = calendarSheduleUtilities.formatUSENTime(beginningTimeStr);
        let endTime = calendarSheduleUtilities.formatUSENTime(endTimeStr);
        return { startTime: beginningTime, endTime: endTime, daysOfWeek: daysOfWeek}
    },
    formatNewConfigureData: function (dateStartStr,dateEndStr,selectedDaysOfWeek) {        
        let selectedDaysOfWeekArray = [];
        selectedDaysOfWeek.each(function () {
            selectedDaysOfWeekArray.push(  $(this).attr('data-value'));
        });
        return calendarSheduleUtilities.formatConfigureItem(dateStartStr, dateEndStr, selectedDaysOfWeekArray)
    },
    initCommonControls: function () {
        $("#schedule-configure-date-start").timepicker({
            mode: 'ampm',
            locale: 'en-us',
            icons: {
                rightIcon: '<i class="fas fa-clock"></i>'
            },
            width: 100,
            format: 'hh:MM TT'
           
        });
        $(".schedule-confirm-add").click(function () {
            if ($("#schedule-configure-date-start").val() == "" ||
                $("#schedule-configure-date-end").val() == "" ) {
                utilitiesBase.errorMessage("Please fill work time period (start and end time)");
                return false;
            }

            if ($(".schedule-configure-dayofweek:checked").length == 0) {
                utilitiesBase.errorMessage("Please fill any day of week for work period");
                return false;
            }
            let configuredData = calendarSheduleUtilities.formatNewConfigureData($("#schedule-configure-date-start").val(),
                $("#schedule-configure-date-end").val(), $(".schedule-configure-dayofweek:checked"));

            if (calendarSheduleUtilities.isDayOfWeekExistsInPeriod(calendarSheduleUtilities.lastSelectedParent, configuredData.daysOfWeek, $(".schedule-configure-modal").attr('generatedid'))) {
                utilitiesBase.errorMessage("One of the days of week also exists in previous generated periods");
                return false;
            }
            
         
            calendarSheduleUtilities.addNewItemToList(calendarSheduleUtilities.lastSelectedParent, configuredData, true, $(".schedule-configure-modal").attr('generatedid'));
            $(".schedule-configure-modal").modal("hide");
        });
        $("#schedule-configure-date-end").timepicker({
            mode: 'ampm',
            locale: 'en-us',
            icons: {
                rightIcon: '<i class="fas fa-clock"></i>'
            },
            width: 100,
            format: 'hh:MM TT'
        });
        $("#schedule-configure-date-start").change(function () {
            let formatted = calendarSheduleUtilities.formatUSENTime($(this).val());
            if (formatted == "Invalid date") {
                $(this).val("");
                return;
            }
            let beginningTime = moment($("#schedule-configure-date-start").val(), 'h:mma');
            let endTime = moment($("#schedule-configure-date-end").val(), 'h:mma');
            if (!beginningTime.isBefore(endTime)) {
                $("#schedule-configure-date-end").val($("#schedule-configure-date-start").val());
            }
        });
        $("#schedule-configure-date-end").change(function () {
            let formatted = calendarSheduleUtilities.formatUSENTime($(this).val());
            if (formatted == "Invalid date") {
                $(this).val("");
                return;
            }
            var beginningTime = moment($("#schedule-configure-date-start").val(), 'h:mma');
            var endTime = moment($("#schedule-configure-date-end").val(), 'h:mma');
            if (!beginningTime.isBefore(endTime)) {
                $("#schedule-configure-date-start").val($("#schedule-configure-date-end").val());
            }
        }); 
    },
    initSchedule: function (parentContainer, showConfigureButtonControl,
        daysContent, showRemoveButton,groupByTime) {
        if (showRemoveButton == undefined || showRemoveButton == null) {
            showRemoveButton = false;
        }
        if (groupByTime == undefined || groupByTime == null) {
            groupByTime = false;
        }
        if (!calendarSheduleUtilities.isCommonControlsConfigured) {
            calendarSheduleUtilities.initCommonControls();
        }
        calendarSheduleUtilities.lastSelectedParent = parentContainer;
        if (showConfigureButtonControl != null && showConfigureButtonControl != undefined) {
            $(showConfigureButtonControl).click(function () {                
                $(".schedule-configure-modal").modal("show");
            });
        }      
        $(parentContainer).off("click", ".shedule-remove-row");
        $(parentContainer).on("click", ".shedule-remove-row", function () {
            $(this).parent().parent().remove();
            let getCollectedData = calendarSheduleUtilities.getSchedule($(parentContainer));
            if (getCollectedData.length == 0) {
                $(parentContainer).find(".schedule-no-days-content").removeClass("d-none");
            }            
        });
        $(parentContainer).off("click", ".shedule-edit-row");
        $(parentContainer).on("click", ".shedule-edit-row", function () {
            let currentRow = $(this).parent().parent();            
            $(".schedule-configure-modal").attr('generatedId', currentRow.attr('generatedId'));
            $(".schedule-configure-modal").modal("show");
            let formattedRowData = calendarSheduleUtilities.formatItemFromRow(currentRow);
            $("#schedule-configure-date-start").val(o_pageBase.dateToClientAMPM(formattedRowData.StartTime));
            $("#schedule-configure-date-end").val(o_pageBase.dateToClientAMPM(formattedRowData.EndTime));
            $(".schedule-configure-dayofweek:checked").prop("checked", false);
            $(".schedule-configure-dayofweek").each(function () {
                if (formattedRowData.DaysOfWeek.indexOf($(this).attr("data-value")) != -1) {
                    $(this).prop('checked', true);
                }                
            });

        });
       
        let daysOfWeek = calendarSheduleUtilities.daysOfWeek;
    
        calendarSheduleUtilities.fillCalendarHeaderDays(parentContainer, calendarSheduleUtilities.daysOfWeek, groupByTime);

        if (daysContent != null && daysContent.length > 0) {
            $(parentContainer).find('.schedule-days-content').html("");
            $(parentContainer).removeClass("d-none");
            $(parentContainer).find(".schedule-no-days-content").addClass("d-none");
            if (groupByTime) {
                let formattedData = calendarSheduleUtilities.formatConfigureItemUsingGroup(daysContent);
                calendarSheduleUtilities.addNewItemToListUsingGroup(parentContainer,
                    formattedData);
            } else {
                for (let i = 0; i < daysContent.length; i++) {

                    calendarSheduleUtilities.addNewItemToList(parentContainer,
                        calendarSheduleUtilities.formatConfigureItem(o_pageBase.dateToClientAMPM(daysContent[i].StartTimeExisting),
                            o_pageBase.dateToClientAMPM(daysContent[i].EndTimeExisting), daysContent[i].DaysOfWeek), showRemoveButton,

                    );
                }
            }
        } else {
            $(parentContainer).removeClass("d-none");
            $(parentContainer).find(".schedule-no-days-content").removeClass("d-none");
        }
     },
    fillTimeOfDay: function (parentContainer, daysOfWeek, startTime, endTime, usePMFormat) {
        let startTimeValue = calendarSheduleUtilities.startTime;
        if (startTime != undefined && startTime != null) {
            startTimeValue = startTime;
        }
        let endTimeValue = calendarSheduleUtilities.endTime;
        if (endTime != undefined && endTime != null) {
            endTimeValue = endTime;
        }
        let usePMFormatValue = calendarSheduleUtilities.usePMFormat;
        if (usePMFormat != undefined && usePMFormat != null) {
            usePMFormatValue = usePMFormat;
        }
        let timesPeriods = [];
        for (let i = startTimeValue; i < endTimeValue; i++) {
            let hourOfDay = i;
            let hourOfDayDispay = hourOfDay;
            let hourOfDayDispayAppendix = "";
            if (usePMFormatValue) {
                hourOfDayDispayAppendix = " AM";
            }
            if (usePMFormatValue && i >= 12) {
                hourOfDayDispayAppendix = " PM";
                if (i == 12) {
                    hourOfDayDispay = 12;
                } else {
                    hourOfDayDispay = i-12;
                }                
            }
            timesPeriods.push({ Name: hourOfDayDispay + ":00" + hourOfDayDispayAppendix, Value: new Date(2021, 0, hourOfDay, i, 0) })
            timesPeriods.push({ Name: hourOfDayDispay + ":30" + hourOfDayDispayAppendix, Value: new Date(2021, 0, hourOfDay, i, 30) })
        }
        calendarSheduleUtilities.fillHoursRows(parentContainer, daysOfWeek, timesPeriods);
    },

    fillHoursRows: function (parentContainer, daysOfWeek, timesPeriods) {
        for (let i = 0; i < timesPeriods.length; i++) {
            let formattedRow = calendarSheduleUtilities.formatTimeOfDayRow(daysOfWeek, timesPeriods[i]);
            parentContainer.find(".schedule-days-content").append(formattedRow);
        }
    },
    addNewItemToList: function (parentObject, newPeriodValue, canShowRemoveButton,
        findedId) {
        $(parentObject).removeClass("d-none");
        let container = $(parentObject).find(".schedule-days-content");
        let generatedData = calendarSheduleUtilities.formatTimeOfDayRow(calendarSheduleUtilities.daysOfWeek, newPeriodValue, canShowRemoveButton);
        if (findedId == null) {
            container.append(generatedData);
        } else {
            let toRemoveRow = $(container).find('.schedule-row[generatedid="' + findedId + '"]');
            $(generatedData).insertAfter(toRemoveRow);
            toRemoveRow.remove();
        }
        $(parentObject).find(".schedule-no-days-content").addClass("d-none");
    },    
    addNewItemToListUsingGroup: function (parentObject,
        loadedDaysEventData) {
        $(parentObject).removeClass("d-none");
        let container = $(parentObject).find(".schedule-days-content");
        let generatedData = calendarSheduleUtilities.
            formatTimeOfDayRowGroupped(calendarSheduleUtilities.daysOfWeek,
                loadedDaysEventData);
        container.append(generatedData);        
        $(parentObject).find(".schedule-no-days-content").addClass("d-none");
    },    
    formatTimeOfDayRow: function (daysOfWeek, periodObject, canShowRemoveButton) {
        let generatedId = helperFunc.newGuid();
        let tds = '<td class="' + "shedule-time-of-day-value" + ' text-center">' + 
            '<p class="prevent-text-select">' + periodObject.startTime + " - " + periodObject.endTime + '</p>' +
            (canShowRemoveButton == false ? "" :
            '<span class="badge badge-pill badge-info prevent-text-select shedule-edit-row pointer-object">Edit</span>' +"&nbsp;|&nbsp;"+
                '<span class="badge badge-pill badge-danger prevent-text-select shedule-remove-row pointer-object">Remove</span>') +
            '</p>'+
            '</td>';
        for (let i = 0; i < daysOfWeek.length; i++) {
            let isUsed = false;
            
            for (let j = 0; j < periodObject.daysOfWeek.length; j++) {
                if (periodObject.daysOfWeek[j] == daysOfWeek[i].Index) {
                    isUsed = true;
                    break;
                }
            }
            tds += '<td class="' + "shedule-day-of-week-value" + ' text-center" data-value="' + daysOfWeek[i].Index + '">'
                +
                calendarSheduleUtilities.functionFormatItemInsideDay(isUsed)+
            '</td>';
        }
        return '<tr  generatedId="' + generatedId +'"  data-value-start="' + periodObject.startTime.toString() + '" data-value-end="' + periodObject.endTime.toString() +'" class="'+"schedule-row"+'">' + tds + "</tr>";
    },
    formatTimeOfDayRowGroupped: function (daysOfWeek, periodObject) {
        let generatedId = helperFunc.newGuid();
        let tds = '';
        for (let i = 0; i < daysOfWeek.length; i++) {
            let isUsed = false;
            let timeInfo = "";
            for (let j = 0; j < periodObject.length; j++) {
                let item = periodObject[j];
                if (item.dayOfWeek == daysOfWeek[i].Index) {
                    isUsed = true;
                    for (let k = 0; k < item.workTimes.length; k++) {
                        let workTime = item.workTimes[k];
                        let contentData = workTime.startTime + "<br>" + workTime.endTime;
                        timeInfo += (timeInfo == "" ? timeInfo : "<br>")+ contentData;
                    }
                    break;
                }
            }
            tds += '<td class="' + "shedule-day-of-week-value" + ' text-center" data-value="' + daysOfWeek[i].Index + '">'
                +
                calendarSheduleUtilities.functionFormatItemInsideDayGroypped(isUsed, timeInfo) +
                '</td>';
        }
        return '<tr  generatedId="' + generatedId + '"   class="' + "schedule-row" + '">' + tds + "</tr>";
    },
    functionFormatItemInsideDay: function (isUsed) {
        if (isUsed == undefined || isUsed == null) {
            isUsed = false;
        }
        return '<div data-value="' + (isUsed ? "1" : "0") + '" class="shedule-day-of-week-value-state card' + (isUsed ? " bg-info text-white" : "") + '">' +
            '<div class="card-body ' + (isUsed ? "text-white" : "text-muted") + ' prevent-text-select pointer-object">' +
            (isUsed ? calendarSheduleUtilities.usedTextDefault : calendarSheduleUtilities.notUsedTextDefault) +
            '</div>' +
            '</div>';
    },
    functionFormatItemInsideDayGroypped: function (isUsed,timesInfo) {
        if (isUsed == undefined || isUsed == null) {
            isUsed = false;
        }
        return '<div data-value="' + (isUsed ? "1" : "0") + '" class="shedule-day-of-week-value-state card' + (isUsed ? " bg-info text-white" : "") + '">' +
            '<div class="card-body ' + (isUsed ? "text-white" : "text-muted") + ' prevent-text-select pointer-object">' +
            (isUsed ? timesInfo : calendarSheduleUtilities.notUsedTextDefault) +
            '</div>' +
            '</div>';
    },
    fillCalendarHeaderDays: function (parentContainer, daysOfWeek, groupByTime) {
        parentContainer.find(".schedule-days-of-week").html("");
        if (!groupByTime) {
            parentContainer.find(".schedule-days-of-week").append(calendarSheduleUtilities.formatItemTimeHeaderValue());
        }
        for (let i = 0; i < daysOfWeek.length; i++) {
            parentContainer.find(".schedule-days-of-week").append(calendarSheduleUtilities.formatItemInHeaderDaysOfWeek(daysOfWeek[i]));
        }
    },
    formatItemTimeHeaderValue: function () {
        return '<th class="schedule-day-of-week-header-time text-center align-middle font-weight-bold" data-value="time">' +
            "Time of day" +
            "</th>";
    },
    formatItemInHeaderDaysOfWeek: function (item) {
        return '<th class="schedule-day-of-week-header-item text-center align-middle font-weight-bold" data-value="' + item.Index + '">' +
            item.Name +     
            "</th>";
    },
    isDayOfWeekExistsInPeriod: function (parentObject,dayOfWeek,doNotCheckThisId) {
        let getCollectedData = calendarSheduleUtilities.getSchedule(parentObject);
        for (let i = 0; i < getCollectedData.length; i++) {
            if (getCollectedData[i].Id != doNotCheckThisId) {
                for (let j = 0; j < dayOfWeek.length; j++) {
                    if (getCollectedData[i].DaysOfWeek.indexOf(dayOfWeek[j]) != -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    formatItemFromRow: function (row) {
        let startTime = $(row).attr("data-value-start");
        let endTime = $(row).attr("data-value-end");
        let daysOfWeek = [];

        $(row).find(".shedule-day-of-week-value").each(function () {
            if ($(this).find(".shedule-day-of-week-value-state").attr('data-value') == "1") {
                daysOfWeek.push($(this).attr('data-value'));
            }
        });
        let generatedRow = {
            Id: $(row).attr('generatedId'),
            StartTime: moment("01.01.2020 " + startTime).utc().format(),
            EndTime: moment("01.01.2020 " + endTime).utc().format(),
            DaysOfWeek: daysOfWeek
        };
        return generatedRow;
    },
    getSchedule: function (parentObject) {
        let selectedItems = [];
        $(parentObject).find('.schedule-row').each(function () {           
            selectedItems.push(calendarSheduleUtilities.formatItemFromRow($(this)));
          
        });
        return selectedItems;
    }
}
var DefaultLinks = {
    /**
     * Формирование ссылки на страницу просмотра продавца
     * @param {any} id
     */
    formatLinkToSellerView: function (id) {
        return '/Account/ViewSeller?id=' + id;
    },
    /**
     * Формирование ссылки на страницу просмотра продукта
     * @param {any} id
     */
    formatLinkToProductView: function (id) {
        return '/Product/ViewProduct?id=' + id;
    },
    /**
     * Формирование ссылки на страницу просмотра бренда
     * @param {any} id
     */
    formatLinkToBrandView: function (id) {
        return '/Reference/BrandView?id=' + id;
    },
    /**
    * Формирование ссылки на страницу просмотра заказов продавца
    * @param {any} id
    */
    formatLinkToSalesViewBasket: function (id) {
        return '/Cart/Sales?basketId=' + id;
    }

}
 