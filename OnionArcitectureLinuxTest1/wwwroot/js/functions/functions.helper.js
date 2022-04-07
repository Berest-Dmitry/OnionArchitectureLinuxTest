var guidEmpty = "00000000-0000-0000-0000-000000000000";

var helperFunc = {
    deserializeParamsFromUrl: function (params, coerce) {
        var obj = {},
            coerce_types = { 'true': !0, 'false': !1, 'null': null };

        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='),
                key = decodeURIComponent(param[0]),
                val,
                cur = obj,
                i = 0,

                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decodeURIComponent(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val              // number
                        : val === 'undefined' ? undefined         // undefined
                            : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                                : val;                                                // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is 
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                            ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : [])
                            : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                    ? undefined
                    : '';
            }
        });

        return obj;
    },
    //добавляем к адресу в браузере доп.параметры из объекта
    attachExactlyParamsToUrl: function (paramsObject) {
        let paramData = $.param(paramsObject);
        let formattedData = "?" + paramData;
        history.pushState(paramsObject, "", "?" + paramData);
        return formattedData;
    },
    parseBrowserSearchParams: function () {
        try {
            var search = location.search.substring(1);
            return helperFunc.deserializeParamsFromUrl(search);
        } catch (exp) {
            return null;
        }
    },
    /**
     * Извлечение параметров из URL.
     * @param {any} url Пример, getAllUrlParams('http://test.com/?a=abc').a; // 'abc'
     */
    getAllUrlParams: function (url) {
        // Извлекаем строку из URL или объекта window.
        let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        // Объект для хранения параметров.
        let obj = {};

        if (queryString) {
            // Данные после знака # будут опущены.
            queryString = queryString.split('#')[0];
            // Разделяем параметры.
            let arr = queryString.split('&');

            for (let i = 0; i < arr.length; i++) {
                // Разделяем параметр на ключ => значение
                let a = arr[i].split('=');
                // Обработка данных вида: list[]=thing1&list[]=thing2
                let paramNum = undefined;
                let paramName = a[0].replace(/\[\d*\]/, function (v) {
                    paramNum = v.slice(1, -1);
                    return '';
                });

                // Передача значения параметра ('true' если значение не задано)
                let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

                // Преобразование регистра
                paramName = paramName.toLowerCase();
                paramValue = paramValue.toLowerCase();

                // Если ключ параметра уже задан.
                if (obj[paramName]) {
                    // Преобразуем текущее значение в массив.
                    if (typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                    }
                    // Если не задан индекс.
                    if (typeof paramNum === 'undefined')
                        obj[paramName].push(paramValue);
                    else
                        obj[paramName][paramNum] = paramValue;
                }
                // Если параметр не задан, делаем это вручную.
                else {
                    obj[paramName] = paramValue;
                }
            }
        }
        return obj;
    },
    clearModal: function (_modal, _data) {
        helperFunc.clearData(_data);
        if (_modal) {
            _modal.find('input').val("").removeAttr("disabled");
            _modal.find('textarea').val("");
            _modal.find('[type="checkbox"]').prop('checked', false);
            _modal.removeClass('was-validated');
        }
    },
    clearData: function (_data) {
        if (_data) {
            $.each(_data, function (key) {
                _data[key] = null;
            });
        }
    },
    
    dataToUrlParam: function (_data) {
        let tmp = "";
        $.each(_data, function (key) {
            if (_data[key] != null) {
                tmp += "&" + key + "=" + _data[key];
            }
        });
        return tmp;
    },
    checkValidation: function (o_sender) {
        $this = $(o_sender);
        o_sender.find($('input[name]')).each(function (key, element) {
            let $el = $(element);
            if ($el.prop('required') && $el.attr('type') !== "checkbox") {
                let vl = $el.val();
                if (vl) {
                    $el.val(vl.trim());
                }
            }
            // Проверка на целое число.
            if ($el.attr('pattern') === "^[0-9]*$") {
                if (!isFinite($el.val()) && $el.val() !== parseInt($el.val(), 10))
                    $el.val("");
            }
        });

        $this.addClass("was-validated");

        let err_count = $this.find(".form-control\:invalid").length;
        if (err_count == 0) {
            $this.removeClass("was-validated");
            return true;
        }
        return false;
    },
    showLoader: function (selector) {
        if (!selector) {
            selector = '.loader-fade';
        }
        $(selector).fadeIn(100);
    },
    hideLoader: function (selector) {
        if (!selector) {
            selector = '.loader-fade';
        }
        $(selector).fadeOut(100);
    },
    initDatePicker: function (datePicker) {
        datePicker.datepicker({
            language: 'ru',
            format: 'dd.mm.yyyy'
        });
    },
    initTimePicker: function (timePicker) {
        timePicker.datetimepicker({
            format: 'HH:mm',
            locale: 'ru',
            stepping: 5
        });
    },
    initDateTimePicker: function (dateTimePicker) {
        dateTimePicker.datetimepicker({
            locale: 'ru',
            format: 'DD.MM.YYYY HH:mm'
        });
    },
    urlParam: function (name) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (!results) {
            return null;
        }
        return results[1] || null;
    },
    newGuid: function () {
        var d = new Date().getTime();
        var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return id;
    },

    /**
     * Метод получения данных для страницы.
     * 
     * @param {String} s_url Путь запроса.
     * @param {Object} post_data Дополнительные данные.
     * @param {Object} jq_notification Объект страницы, отображающий уведомления.
     * @param {Function} callback Функция обратного вызова.
     * @param {Boolean} isload Отключение loader.
     */
    getDataDB: function (s_url, post_data, jq_notification, callback, isload) {
        if (isload === undefined || isload === null || isload === true) {
            helperFunc.showLoader();
        }
        $.ajax({
            url: s_url,
            type: 'GET',
            cache: false,
            data: post_data,
            success: function (data) {
                if (data) {
                    //if (data.result == 1) {
                    //    if (callback) {
                    //        if (data.entity !== undefined && data.entity !== null) {
                                callback(data/*.entity*/);
                    //        } else if (data.value !== undefined && data.value !== null) {
                    //            callback(data.value);
                    //        } else {
                    //            callback();
                    //        }
                    //    }
                    //} else {
                    //    if (!!jq_notification) {
                    //        jq_notification.bindNotification(data.message, "alert-danger");
                    //    } else {
                    //        alert(data.message);
                    //    }
                    //}
                }
            },
            error: function (error) {
                if (!!jq_notification) {
                    jq_notification.bindNotification('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.', "alert-danger");
                } else {
                    alert('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.');
                }
            }
        });
    },
    /**
     * Метод добавления/редактирования записи. 
     * @param {any} s_url Путь к методу.
     * @param {any} o_data Объект отправки.
     * @param {any} jq_notification Уведомление.
     * @param {any} callback Функция обратного вызова.
     */
    updateDataDB: function (s_url, o_data, jq_notification, callback) {
        helperFunc.showLoader();
        $.ajax({
            url: s_url,
            type: 'POST',
            cache: false,
            data: o_data,
            success: function (data) {
                if (data) {
                    if (data.result == 1) {
                        if (!!jq_notification) {
                            jq_notification.bindNotification("Данные успешно сохранены.", "alert-success");
                        }
                        if (callback) {
                            if (data.value !== undefined && data.value !== null)
                                callback(data.value);
                            else
                                callback();
                        }
                        
                    } else {
                        if (!!jq_notification) {
                            jq_notification.bindNotification(data.message, "alert-danger");
                        } else {
                            alert(data.message);
                        }
                    }
                }
            },
            error: function (error) {
                if (!!jq_notification) {
                    jq_notification.bindNotification('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.', "alert-danger");
                } else {
                    alert('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.');
                }
            }
        });
    },
    /**
     * Метод передачи данных на добавления/редактирования записи. (Обертка метода updateDataDB).
     * @param {Object} o_modal Модальное окно.
     * @param {String} s_url Путь к методу, который будет вызываться.
     * @param {Object} o_data Данные для отправки.
     * @param {Object} jq_notification Уведомление.
     */
    updateRecordDb: function (o_modal, s_url, o_data, jq_notification, callback) {
        o_data = $.extend(o_data, helperFunc.getFormData(o_modal));
        o_data.userHasChanged = helperFunc.getCurrentUser();

        helperFunc.updateDataDB(s_url, o_data, jq_notification, callback);
        helperFunc.clearModal(o_modal, o_data);
    },
    /**
     * Метод передачи данных на удаление  записи.
     * @param {String} s_url Путь к методу, который будет вызываться.
     * @param {Object} o_data Данные для отправки.
     * @param {Object} jq_notification Уведомление.
     * @param {any} callback Функция обратного вызова.
     */
    deleteDataDB: function (s_url, o_data, jq_notification, callback) {
        $.ajax({
            url: s_url,
            type: 'POST',
            cache: false,
            data: o_data,
            success: function (data) {
                if (data) {
                    if (data.result == 1) {
                        if (!!jq_notification) {
                            jq_notification.bindNotification("Данные удалены успешно.", "alert-success");
                        }
                    } else {
                        if (!!jq_notification) {
                            jq_notification.bindNotification(data.message, "alert-danger");
                        } else {
                            alert(data.message);
                        }
                    }
                }
                if (callback) {
                    callback();
                }
            },
            error: function (error) {
                if (!!jq_notification) {
                    jq_notification.bindNotification('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.', "alert-danger");
                } else {
                    alert('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.');
                }
            }
        });
    },
	/**
	 * Метод отображение модального окна с установкой титула, сообщения.
	 * @param {String} confirmTitle Сообщение в шапке модального окна.
	 * @param {String} confirmMsg Сообщение в теле модального окна.
	 * @param {any} callback Функции после выполнения основной функции.
	 */
    updateDataDbWithConfirm: function (confirmTitle, confirmMsg, callback) {
        bootbox.confirm({
            title: confirmTitle,
            message: confirmMsg,
            buttons: {
                confirm: {
                    label: "<span class='mdi mdi-check pr-lg - 1'></span>Да",
                    className: 'btn-success'
                },
                cancel: {
                    label: "<span class='mdi mdi-close pr-lg-1'></span>Нет",
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result)
                    callback();
            }
        });
    },
    /**
     * Метод загрузки файла.
     * @param {any} s_url
     * @param {any} f_data
     * @param {Object} jq_notification Уведомление.
     * @param {any} callback Функция обратного вызова.
     */
    uploadFile: function (s_url, f_data, jq_notification, callback) {
        helperFunc.showLoader();
        $.ajax({
            url: s_url,
            type: "POST",
            contentType: false,
            processData: false,
            data: f_data,
            success: function (data) {
                if (data) {
                    if (data.result != 1) {
                        if (!!jq_notification) {
                            jq_notification.bindNotification(data.message, "alert-danger");
                        } else {
                            alert(data.message);
                        }
                    }
                }
                if (callback) {
                    callback();
                }
            },
            error: function (error) {
                if (!!jq_notification) {
                    jq_notification.bindNotification('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.', "alert-danger");
                } else {
                    alert('Ошибка загрузки страницы. Закройте все окна браузера и повторите попытку.');
                }
            }
        });
    },
    /**
     * Функция инициализации таблицы.
     * @param {Object} o_sender Объект для привязки плагина.
     * @param {Object} options Настройки плагина. Обязательные поля объекта: <ul>
     * <li>@param {Array} url Ссылка для отправки запроса.</li>
     * <li>@param {Array} colNames Массив названий полей (порядок важен).</li>
     * <li>@param {Array} colModel Массив объектов моделей (порядок важен).</li>
     * <li>@param {String} sortOrder Пареметр сортировки таблицы.</li>
     * <li>@param {String} sortName Поле сортировки таблицы.</li>
     * </ul>
     */
    initJqGrid: function (o_sender, options, jq_notification, callback) {
        let settings = $.extend({
            rowNum: 50,
            autowidth: true,
            loadonce: false,
            pager: true,
            idPrefix: "g1_",
            iconSet: "fontAwesome",
            guiStyle: "bootstrap4",
            rownumbers: true,
            rowList: [10, 25, 50, 100, 500],
            viewrecords: true,
            height: '100%',
            jsonReader: {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                repeatitems: false
            },
            loadComplete: function (data) {
                if (data && data.result === 0) {
                    if (!!jq_notification) {
                        jq_notification.bindNotification(data.message, "alert-danger");
                    }
                    else {
                        alert(data.message);
                    }
                }
                helperFunc.hideLoader();
            },
            gridComplete: function () {
                if (callback) {
                    callback();
                }
            }
        }, options);

        o_sender.jqGrid(settings);

        // Изменение размера таблицы.
        let jq_main_container = $('#main'),
            jq_container = o_sender.closest(".container-fluid");

        $(window).bind("resize", function () {
            let width = jq_container.width() * 0.99;
            if (jq_main_container.length > 0)
                width = jq_main_container.width() * 0.99;

            o_sender.jqGrid("setGridWidth", width);
        }).triggerHandler("resize");
    },
    initJqTreeGrid: function (o_sender, options, jq_notification, callback) {
        let settings = $.extend({
            datatype: "local",
            treedatatype: "json",
            height: 'auto',
            autowidth: true,
            iconSet: "fontAwesome",
            guiStyle: "bootstrap4",
            treeGrid: true,
            treeGridModel: 'adjacency',
            ExpandColumn: 'name',
            loadComplete: function (data) {
                if (data && data.result === 0) {
                    if (!!jq_notification) {
                        jq_notification.bindNotification(data.message, "alert-danger");
                    }
                    else {
                        alert(data.message);
                    }
                }
                helperFunc.hideLoader();
            },
            gridComplete: function () {
                if (callback) {
                    callback();
                }
            }
        }, options);

        o_sender.jqGrid(settings);

        $(window).bind("resize", function () {
            o_sender.jqGrid("setGridWidth", o_sender.closest(".container-fluid").width() * 0.99);
        }).triggerHandler("resize");
    },
    jqGridExpandToNode: function (o_tree, row) {
        if (row != null && row.parent) {
            parentRow = o_tree.jqGrid('getLocalRow', row.parent);
            if (parentRow != null) {
                if (!parentRow.expanded) {
                    o_tree.jqGrid('expandNode', parentRow).jqGrid('expandRow', parentRow);
                }
                helperFunc.jqGridExpandToNode(o_tree, parentRow);
            }
        }
    },
    jqGridAddNodeSelectClass: function (rowid) {
        $("#" + rowid).toggleClass("table-success").attr("tabindex", "0").attr("aria-selected", "true");
        $("#sidebar .ui-jqgrid-bdiv").scrollTop(0).scrollTop($("#" + rowid).offset().top - 300);
    },
    //Поиск по дереву
    jqGridSearchTreeNode: function (o_tree, search) {
        $.each(o_tree.jqGrid('getRootNodes'), function (key, row) {
            if (!row.expanded)
                o_tree.jqGrid('expandNode', row).jqGrid('expandRow', row);
            helperFunc.jqGridShowFindNode(row.name, row.id.split('_')[0], search);
            helperFunc.jqGridSearchTreeSubNode(o_tree, row, search);
        });
    },
    jqGridSearchTreeSubNode: function (o_tree, row, search) {
        $.each(o_tree.jqGrid('getNodeChildren', row), function (key, subrow) {
            if (!subrow.isLeaf) {
                if (!subrow.expanded)
                    o_tree.jqGrid('expandNode', subrow).jqGrid('expandRow', subrow);
                helperFunc.jqGridShowFindNode(subrow.name, subrow.id, search);
                helperFunc.jqGridSearchTreeSubNode(o_tree, subrow, search);
            }
            else {
                helperFunc.jqGridShowFindNode(subrow.name, subrow.id, search);
            }
        });
    },
    jqGridShowFindNode: function (node_name, node_id, str_search) {
        var tr = $("#" + node_id);
        if (node_name.toLowerCase().indexOf(str_search) < 0) {
            if (!tr.hasClass("jqgrid-search-hidden"))
                tr.toggleClass("jqgrid-search-hidden");
        }
        else {
            if (tr.hasClass("jqgrid-search-hidden"))
                tr.toggleClass("jqgrid-search-hidden");
        }
    },
    //Очистить результат поиска
    jqGridClearTreeSearchResult: function (o_tree) {
        $(".jqgrid-search-hidden").removeClass("jqgrid-search-hidden");
        helperFunc.jqGridCollapseAllNode(o_tree);
        var rowid = o_tree.jqGrid('getGridParam', 'selrow');
        if (rowid != null) {
            helperFunc.jqGridExpandToNode(o_tree, o_tree.jqGrid('getLocalRow', rowid));
            $("#sidebar .ui-jqgrid-bdiv").scrollTop(0).scrollTop($("#" + rowid).offset().top - 300);
        }
    },
    jqGridCollapseAllNode: function (o_tree) {
        $.each(o_tree.jqGrid('getRootNodes'), function (key, row) {
            if (row.expanded)
                o_tree.jqGrid('collapseNode', row).jqGrid('collapseRow', row);
            helperFunc.jqGridCollapseAllSubNode(o_tree, row);
        });
    },
    jqGridCollapseAllSubNode: function (o_tree, row) {
        $.each(o_tree.jqGrid('getNodeChildren', row), function (key, subrow) {
            if (!subrow.isLeaf) {
                if (subrow.expanded)
                    o_tree.jqGrid('collapseNode', subrow).jqGrid('collapseRow', subrow);
                helperFunc.jqGridCollapseAllSubNode(o_tree, subrow);
            }
        });
    },
    /**
     * Метод собирает все значения инпутов с формы.     
     * @param {Object} o_form Объект формы.
     */
    getFormData: function (o_form, a_class) {
        let filter = "[name]";
        if (a_class) {
            filter += "." + a_class;
        }

        let a_data = {},
            a_jq_values = o_form.find($(filter));

        if (!!a_jq_values) {
            a_jq_values.each(function (key, element) {
                if ($(element).attr('type') === "checkbox")
                    a_data[$(element).attr('name')] = $(element).is(":checked");
                else
                    a_data[$(element).attr('name')] = $(element).val();
            });
        }

        return a_data;
    },
    getFormDataAsArrayFormData: function (o_form, a_class,objectForm) {
        let filter = "[name]";
        if (a_class) {
            filter += "." + a_class;
        }

        let a_data = [],
            a_jq_values = o_form.find($(filter));

        if (!!a_jq_values) {
            a_jq_values.each(function (key, element) {
                if ($(element).attr('type') === "checkbox")
                    a_data.push({
                        key: $(element).attr('name'),
                        value: $(element).is(":checked")
                    });
                else
                    a_data.push({
                        key: $(element).attr('name'),
                        value: $(element).val()
                    }); 
            });
        }
        for (let i = 0; i < a_data.length; i++) {
            objectForm.append(a_data[i].key, a_data[i].value);
        }
     
    },
	/**
     * Метод устанавливает значения в инпуты на форме.
     * @param {Object} o_form Объект формы.
     * @param {Object} data Данные для заполнения.
	 * @param {Object} a_class доп класс для фильтра элементов
     */
    setFormData: function (o_form, data, a_class) {
        if (data) {
            let filter = "[name]";
            if (a_class) {
                filter += "." + a_class;
            }

            o_form.find($(filter)).each(function (key, element) {
                let $el = $(element);
                let vl = data[$el.attr('name')];

                if ($el.is("label")) {
                    $el.text(vl);
                } else if ($el.is('textarea')) {
                    $el.val(vl);
                } else if ($el.is("input")) {
                    if ($el.attr('type') === "checkbox") {
                        $el.prop('checked', vl);
                    }
                    else {
                        $el.val(vl);
                    }
                } else if ($el.is("select")) {
                    if (vl && vl !== guidEmpty) {
                        $el.val(vl);
                    } else/* if ($el.prop('required'))*/ {
                        $el.find('option:eq(0)').prop('selected', true);
                    }

                    if ($el.hasClass('selectpicker')) {
                        $el.selectpicker('refresh');
                    }

                    if ($el.hasClass('select2')) {
                        $el.trigger('change');
                    }
                }
            });
        }
    },
    /* Метод получения текущего пользователя. */
    getCurrentUser: function () {
        let jq_modal = $('#userProfileInfo'),
            surname = jq_modal.find('.surname').text(),
            firstName = jq_modal.find('.firstName').text(),
            login = jq_modal.find('.login').text();

        return surname + ' ' + firstName + ' (' + login + ')';
    },
	/**
	 * Метод получения типа ДЦ 
	 * 0 - ИА
	 * 1 - ОДУ
	 * 2 - РДУ 
	 * */
    getDcTypeCurrentUser: function () {
        let jq_modal = $('#userProfileInfo'),
            dctype = jq_modal.find('.dcname').attr("dctype");
        return dctype;
    },
    /**
     * Метод конвертирует в дату вида: DD.MM.YYYY
     * @param {any} date
     */
    convertDate: function (date) {
        return moment(date).format("MM/DD/YYYY");
    },
    /**
     * Метод конвертирует в дату вида: DD.MM.YYYY HH:mm:ss
     * @param {any} date
     */
    convertDateFull: function (date) {
        return moment(date).format("MM/DD/YYYY HH:mm:ss");
    },
    /**
     * Метод конвертирует в дату вида: DD.MM.YYYY HH:mm
     * @param {any} date
     */
    convertDateMin: function (date) {
        return moment(date).format("DD.MM.YYYY HH:mm");
    },
    /**
     * Метод генерации года от текущего.
     * @param {any} offset Смещение. Пример: offset=3, 2019-2016.
      */
    generationYear: function (offset) {
        let currentYear = new Date().getFullYear(),
            year = [];

        for (let i = currentYear - offset; i <= currentYear; i++)
            year.unshift({ id: i, text: i });

        return year;
    },
    fillSelect: function (data, o_select, callback) {
        let count = 0,
            option = '';

        if (!o_select.prop('required') && !o_select.prop('multiple')) {
            option = '<option value="">...</option>';
        }

        if (data) {
            $.each(data, function (key, value) {
                option += '<option value="' + value.id + '">' + value.text + '</option>';
                count++;
            });
        }

        o_select.html(option).selectpicker('refresh');

        if (callback) {
            callback(count);
        }
    },
    loadModalSelect: function (url, o_select, jq_notification, data, callback) {
        helperFunc.getDataDB(url, data, jq_notification, function (entity) {
            $.each(o_select, function (key, value) {
                helperFunc.fillSelect(entity, $(value), callback);
            });
        });
    },
	/**
     * Функция сравнения полей модальной таблицы для установки чекбоксов в положение выбрано если строки равны и наоборот
     * @param {any} o_form
     * @param {any} data
     * @param {any} data2
     */
    compareImportTableData: function (o_table, a_data, a_data_2) {
        if (a_data_2) {
            $.each(a_data_2, function (key, value) {
                let prop = false;
                if (!a_data || a_data[key] !== value) {
                    prop = true;
                }
                $("input[name='" + key + "'].union-checkbox", o_table).prop('checked', prop);
            });
        }
    },
    checkValidationImportTableData: function (o_table, o_baseEntity) {
        $this = $(o_table);
        let valids = [];
        o_table.find($('input[name].import')).each(function (key, element) {
            let $el = $(element);
            if ($el.prop('required') && $el.attr('type') !== "checkbox") {
                let vl = $el.val();
                if (vl) {
                    $el.val(vl.trim());
                }

                let cb = o_table.find("[name='" + $el.attr('name') + "'].system-checkbox.union-checkbox");
                if ((!cb || cb.length == 0 || !cb.is(':checked')) && o_baseEntity) {
                    element.required = false;
                    valids.push(element);
                }
            }
        });

        $this.addClass("was-validated");

        let err_count = $this.find(".form-control\:invalid").length;
        if (err_count == 0) {
            $this.removeClass("was-validated");
            for (var i = 0; i < valids.length; i++) {
                valids[i].required = true;
            }

            return true;
        }
        return false;
    },
    getImportTableData: function (o_table, a_data, a_data2) {
        if (a_data === null || a_data === undefined) {
            return $.extend(a_data2, helperFunc.getFormData(o_table, "import"));
        }
        let a_jq_values = o_table.find('.system-checkbox.union-checkbox:checked');
        if (!!a_jq_values) {
            a_jq_values.each(function (key, element) {
                let $el = $("[name='" + $(element).attr('name') + "'].import", o_table);
                if ($el.attr('type') === "checkbox") {
                    a_data[$el.attr('name')] = $el.is(":checked");
                }
                else {
                    a_data[$el.attr('name')] = $el.val();
                }
            });
        }
        return a_data;
    },
    clearImportTableData: function (o_table, a_data, a_data2) {
        helperFunc.clearData(a_data);
        helperFunc.clearData(a_data2);
        if (o_table) {
            o_table.find('input').val("");
            o_table.find('textarea').val("");
            o_table.removeClass('was-validated');
            o_table.find('label.spravochnik').text("-");
            o_table.find('input[type=checkbox]').prop('checked', false);
        }
    },
    /**
     * Метод обработки моножественного выбора.
     * @param {Object} o_sender Чекбокс по которому кликают.
     * @param {Array} checkedRows Результирующий массив.
     */
    multipleSelection: function (o_sender, checkedRows) {
        let id = o_sender.attr("attr-id"),
            index = $.inArray(id, checkedRows);

        if (o_sender.is(":checked") && index === -1) {
            checkedRows.push(id);
        } else if (!o_sender.is(":checked") && index !== -1) {
            checkedRows.splice(index, 1);
        }

        return checkedRows;
    },
    /**
     * Метод обработки выбора всех элементов таблицы.
     * @param {Object} a_checkbox Массив объектов checkbox
     * @param {Object} o_check_all checkbox выбрать все.
     * @param {Array} checkedRows Результирующий массив.
     */
    selectAllRows: function (a_checkbox, o_check_all, checkedRows) {
        if (o_check_all.is(":checked")) {
            $.each(a_checkbox, function (k, el) {
                $(el).prop('checked', true);
                helperFunc.multipleSelection($(el), checkedRows)
            });
        } else {
            $.each(a_checkbox, function (k, el) {
                $(el).prop('checked', false);
                helperFunc.multipleSelection($(el), checkedRows)
            });
        }
    },
    /**
     * Проверяет все ли checkbox в таблице выбранны, если true, тогда устанавливает CheckAll.
     * @param {Object} a_checkbox Массив объектов checkbox
     * @param {Object} o_check_all checkbox выбрать все.
     */
    isEveryoneSelected: function (a_checkbox, o_check_all) {
        let fl_check = true;
        $.each(a_checkbox, function (k, el) {
            if (!$(this).is(":checked"))
                fl_check = false
        });
        o_check_all.prop('checked', fl_check);
    },
    /**
     * Метод добавления cache.
     * @param {String} key
     * @param {Object} a_data
     */
    setCache: function (key, a_data) {
        localStorage[key] = JSON.stringify(a_data);
    },
    /**
     * Метод получения cache.
     * @param {String} key
     */
    getCache: function (key) {
        try {
            let data = localStorage[key],
                cache_data = null;

            if (data)
                cache_data = JSON.parse(data);

            return cache_data;
        } catch {
            return null;
        }
    },
    /*
     * метод инициализации селекта
     */
    initSelect: function (url, o_select, live_search, required, jq_notification, callback) {
        let option = {
           // theme: "bootstrap",
            width: 'element',
            delay: 500,
            language: "en",
            placeholder: null,
            allowClear: false
        };
        if (!required) {
            option.placeholder = '. . .';
            option.allowClear = true;
        }
        if (o_select.attr("multiple") !== undefined) {
            option.closeOnSelect = false;
        }
        if (!!live_search) {
            o_select.select2(
                $.extend(option, {
                    minimumInputLength: 2,
                    ajax: {
                        url: url,
                        dataType: 'json',
                        cache: false,
                        processResults: function (data) {
                            if (data) {
                                //if (data.result == 1) {
                                    return {
                                        results: data//.entity
                                    };
                                //}
                                //if (!!jq_notification) {
                                //    jq_notification.bindNotification(data.message, "alert-danger");
                                //} else {
                                //    alert(data.message);
                                //}
                            }
                            return {
                                results: []
                            };
                        }
                    }
                }));
        } else {
            helperFunc.getDataDB(url, null, jq_notification, function (entity) {
                o_select.select2($.extend(option, {
                    minimumResultsForSearch: Infinity,
                    data: entity
                }));
                helperFunc.hideLoader();
                if (callback) {
                    callback();
                }
            });
        }

    },
/**
* Метод получения списка выбранных элементов селекта.
 * @param {Object} selectObject
*/
    getSelectedItemsFromSelect: function (selectObject) {
        let filledData = [];
        $(selectObject).find("option").each(function () {
         
            filledData.push({
                id: $(this).attr('value'),
                text:$(this).text()
            })
        });
        return filledData;
    }
};