$(document).ready(function () {
	o_page.initPage();

	let jq_body = $('body');
	/*search init*/
	jq_body.on("click", '.js-search-btn', function () {
		let jq_search_table = $('#bt-table_wrapper .dataTables_filter input[type="search"]');
		jq_search_table.val($(".js-search-input").val());
		jq_search_table.keyup();
		o_page.searchInit();
	});

	/*search on enter press*/
	jq_body.on("keydown", '.js-search-input', function (event) {
		if (event.keyCode == 13) {
			let jq_search_table = $('#bt-table_wrapper .dataTables_filter input[type="search"]');
			jq_search_table.val($(".js-search-input").val());
			jq_search_table.keyup();
			o_page.searchInit();
		}
	});
});

var o_page = {
	jq_table: $("#bt-table"),
	o_table: null,
	recordId: null,
	searchInit: function () {
		let jq_search_table = $('#bt-table_wrapper .dataTables_filter input[type="search"]');
		jq_search_table.val($(".js-search-input").val());
		$('#bt-table-btn_search').click();
	},

	initPage: function () {
		o_page.jq_table.on("preInit.dt", function () {
			$("#bt-table_wrapper input[type='search']").after("<button type='button' id='bt-table-btn_search'>Search</button>");
		});

		$(".btn-add-role").on("click", function () {
			helperFunc.clearModal($('#addNewRole'), null);
			$("#addNewRole").find("label").removeClass("active");
			$("#addNewRole").modal("show");
			$('#addNewRole').find('.modal-title').text('Добавить роль');
		});

		$(".btn-save-change").on('click', function () {
			o_page.saveChange();
		});

		o_page.o_table = o_page.jq_table.DataTable({
			order: [[1, "asc"]],
			pageLength: 25,
			lengthMenu: [[10, 25, 50], [10, 25, 50]],
			stateSave: true,
			autoWidth: true,
			processing: true,
			serverSide: true,
			paging: true,
			pagingType: 'full',
			searching: { regex: true },
			language: dataTableRu,
			initComplete: function () { o_pageBase.initStyleTable('bt-table') },
			ajax: {
				url: '/Role/GetAllRoles',
				type: "POST",
				cache: false,
				data: function (a_data) {

				}
			},
			columns: [
				{ name: 'id', data: 'id', title: "id", className: "align-middle", visible: false },
				{ name: 'roleName', data: 'roleName', title: "Название", className: "align-middle", width: "55%" },
				{
					title: "Действительна", orderable: false, className: "text-center align-middle btn-remove-role", width: "25%", render: function (data, type, row) {
						let html_item = '<i title="false" id="' + row.id + '" class="fas fa-check" style="color: #154734;"></i>';
						if (row.isRemoved)
							html_item = '<i title="true" id="' + row.id + '" class="fas fa-trash-alt" style="color: #9D2235;"></i>';
						return html_item;
					}
				},
				{
					title: "Ред.", orderable: false, className: "text-center align-middle", width: "10%", render: function (data, type, row) {
						return '<a data-row-id="' + row.id + '" class="btn-floating btn-sm btn-secondary btn-edit-role"><i title="Edit" class="fas fa-edit"></i></a>';
					}
				},
				{
					title: "Удал.", orderable: false, className: "text-center align-middle", width: "10%", render: function (data, type, row) {
						return '<a data-row-id="' + row.id + '" class="btn-floating btn-sm btn-danger btn-delete-role"><i title="Delete" class="fas fa-trash"></i></a>';
					}
				},
			],
		}).on("click", ".btn-edit-role", function () {
			var this_Id = $(this).attr("data-row-id");
			$.ajax({
				url: '/Role/GetRoleToEdit',
				type: "GET",
				data: {
					Id: this_Id
				},
				success: function (res) {
					let jq_modal = $("#addNewRole");
					helperFunc.clearModal(jq_modal);
					helperFunc.setFormData(jq_modal, res);

					jq_modal.modal("show");
					jq_modal.find(".modal-title").text("Редактирование роли");
					jq_modal.find('label').addClass("active");
				},
				error: function () {

				}
			});

		}).on("click", ".btn-delete-role", function () {
			o_page.recordId = $(this).attr("data-row-id");
			let jq_del_modal = $('#ConfirmModal');
			jq_del_modal.modal("show");
			$('#DismissDelete').on('click', function () {
				o_page.recordId = null;
				jq_del_modal.modal("hide");
			});
			$('#ConfirmDelete').on('click', function () {
				o_page.deleteRole();
				jq_del_modal.modal("hide");
			});

			//confirmUtilites.confirm('Удалить роль', 'Вы уверены, что хотите удалить эту роль?', 'danger'
			//	, function () { o_page.deleteRole() }
			//	, function () { o_page.recordId = null });
		}).on('click', '.btn-remove-role', function () {
			let item = $(this).children().first();
			if (item && item.length > 0) {
				let msg = '';
				let item_id = item.attr('id');
				msg = (item.hasClass('fa-check')) ? 'Вы уверены, что хотите сделать роль недействительной?' : 'Вы уверены, что хотите восстановить роль?';
				confirmUtilites.confirm('Удалить/восстановить роль', msg, 'danger'
					, function () {
						$.ajax({
							url: "/Role/MarkRoleAsRemoved",
							type: "POST",
							data: {
								thisId: item_id
							},
							success: function (res) {
								if (!res.result) {
									utilitiesBase.errorMessage(res.ErrorInfo);
								}
								else {
									o_page.jq_table.DataTable().ajax.reload();
								}
							}
						});
					}
					, function () { o_page.recordId = null });
			}
		});
	},

	saveChange: function () {
		let jq_modal = $("#addNewRole");
		let modal_data = helperFunc.getFormData(jq_modal);
		if (modal_data) {
			if (modal_data.id && modal_data.id != guidEmpty) {
				$.ajax({
					url: '/Role/UpdateThisRole',
					type: "POST",
					data: modal_data,
					success: function (res) {
						if (res && res.id && res.id != guidEmpty) {
							utilitiesBase.infoMessage("Данная роль успешно обновлена!");
							o_page.jq_table.DataTable().ajax.reload();
							helperFunc.clearModal(jq_modal, modal_data);
							jq_modal.find('label').removeClass("active");
							jq_modal.modal('hide');
						}
					}
				});
			}
			else {
				$.ajax({
					url: '/Role/CreateNewRole',
					type: "POST",
					data: modal_data,
					success: function (res) {
						if (res && res.id && res.id != guidEmpty) {
							utilitiesBase.infoMessage("Роль успешно создана!");
							helperFunc.clearModal(jq_modal, modal_data);
							o_page.jq_table.DataTable().ajax.reload();
							jq_modal.find('label').removeClass("active");
							jq_modal.modal('hide');
						}
					}
				});
			}
		}
	},

	deleteRole: function () {
		$.ajax({
			url: '/Role/DeleteThisRole',
			type: "POST",
			data: {
				Id: o_page.recordId
			},
			success: function (res) {
				if (!res.result) {
					utilitiesBase.errorMessage(res.ErrorInfo);
				}
				else {
					o_page.jq_table.DataTable().ajax.reload();
				}
			},
			error: function () {

			}
		});
	}
};