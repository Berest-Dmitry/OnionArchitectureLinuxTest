/*/*const { ajax } = require("jquery");*/

$(document).ready(function () {
	o_page_UserRoles.initPage();

	//$(document).on('click', 'a.delete-license', function () {
	//	o_page.deleteLicenseFile($(this).attr("attr-id"));
	//});
});

var o_page_UserRoles = {
	jq_users_list: $("#UsersList"),
	jq_roles_List: $("#RolesList"),
	jq_chain_btn: $('.btn-add-root'),
	jq_unchain_btn: $('.btn-remove-root'),
	jq_show_btn: $('.btn-show-root'),
	show_or_hide: null,
	//users: [],
	//roles: [],
	chosen_user: null,
	chosen_role: null,

	initPage: function () {
		o_page_UserRoles.loadAllUsers();
		o_page_UserRoles.loadRolesList();
		o_page_UserRoles.show_or_hide = false;
		/*кнопка прикрепления роли*/
		this.jq_chain_btn.on("click", function () {
			if (!o_page_UserRoles.chosen_role || !o_page_UserRoles.chosen_user) {
				utilitiesBase.errorMessage("Не был выбран пользователь или роль!");			
			}
			else {
				$.ajax({
					url: '/UserRoles/AttachRoleToUser',
					type: "POST",
					data: {
						userId: o_page_UserRoles.chosen_user,
						roleId: o_page_UserRoles.chosen_role
					},
					success: function (res) {
						if (!res.result) {
							utilitiesBase.errorMessage("Произошла ошибка при связывании пользователя с ролью: " + res.errorInfo);
						}
						else {
							utilitiesBase.infoMessage("Пользователь и роль успешно связаны!");
						}
					}
				});
			}
		});

		/*кнопка открепления роли*/
		this.jq_unchain_btn.on("click", function () {
			if (!o_page_UserRoles.chosen_role || !o_page_UserRoles.chosen_user) {
				utilitiesBase.errorMessage("Не был выбран пользователь или роль!");
			}
			else {
				$.ajax({
					url: '/UserRoles/DetachRoleFromUser',
					type: "POST",
					data: {
						userId: o_page_UserRoles.chosen_user,
						roleId: o_page_UserRoles.chosen_role
					},
					success: function (res) {
						if (!res.result) {
							utilitiesBase.errorMessage("Произошла ошибка при удалении связи пользователя с ролью: " + res.errorInfo);
						}
						else {
							utilitiesBase.infoMessage("Связь успешно удалена!");
						}
					}
				});
			}
		});

		this.jq_show_btn.on("click", function () {
			if (!o_page_UserRoles.chosen_user) {
				utilitiesBase.errorMessage("Не был выбран пользователь!");
			}
			else {
				o_page_UserRoles.show_or_hide = !o_page_UserRoles.show_or_hide;
				if (o_page_UserRoles.show_or_hide) {
					$.ajax({
						url: '/UserRoles/GetRolesList',
						type: "GET",
						data: {
							userId: o_page_UserRoles.chosen_user
						},
						success: function (res) {
							//o_page_UserRoles.jq_show_btn.text("Показать связи");

							if (res && res.length > 0) {
								res.forEach(function (item) {
									let jq_role = o_page_UserRoles.jq_roles_List.find('#' + item.id);
									if (jq_role) {
										//jq_role.attr("style", "background-color: white; color: black; border-color: white;");
										jq_role.append('<i class="fas fa-check" style="color: #154734;"></i>')
									}
								});
								o_page_UserRoles.jq_roles_List.children().each(function (index, element) {
									element.children[1].setAttribute("style", "background-color: white; color: black; border-color: white;");
									element.children[1].removeAttribute("onclick");
								});
							}
						}
					});
				}
				else {
					//o_page_UserRoles.jq_show_btn.text("Скрыть связи");

					o_page_UserRoles.jq_roles_List.children().each(function (index, element) {
						let id = element.children[1].getAttribute("id");
						element.children[1].setAttribute("onclick", 'o_page_UserRoles.selectRole(\'' + id + '\')')
						var check = element.querySelector(".fa-check");
						if (check) check.remove();
					});
				}
			}
		});
	},

	/** метод загрузки всех пользователей */
	loadAllUsers: function() {
		$.ajax({
			url: '/UserRoles/GetAllUsers',
			type: "GET",
			success: function (res) {
				if (res && res.length > 0) {
					//for (let i = 0; i < res.length; i++) {
					//	o_page_UserRoles.users.push(res[i]);
					//}
					res.forEach(function (item) {
						o_page_UserRoles.jq_users_list.append('<li class="m-2 p-2"><p style="display: none;">' +
							item.id + '</p>'
							+ '<p id="' + item.id + '" class="text-canter align-middle" onclick="o_page_UserRoles.selectUser(\'' + item.id + '\')">' + item.userName + '</p></li>');
					});					
				}
			},
			error: function () {

			}
		});
	},

	/**
	 * метод загрузки списка ролей
	 */
	loadRolesList: function () {
		$.ajax({
			url: '/UserRoles/GetRolesList',
			type: "GET",
			//data: {
			//	userId: userId
			//},
			success: function (res) {
				if (res && res.length > 0) {
					o_page_UserRoles.jq_roles_List.empty();
					res.forEach(function (item) {
						o_page_UserRoles.jq_roles_List.append('<li class="m-2 p-2"><p style="display: none;">' +
							item.id + '</p>'
							+ '<p id="' + item.id + '" class="text-canter align-middle" onclick="o_page_UserRoles.selectRole(\'' + item.id + '\')">'
							+ item.rolename + '</p></li>');
					});
				}
			},
			error: function () {

			}
		});
	},
	/**
	 * выбор пользователя в списке
	 * @param {any} userId
	 */
	selectUser: function (userId) {
		o_page_UserRoles.chosen_user = userId;
		var this_el = this.jq_users_list.find('#' + userId);
		var this_parent = this_el.parent().parent();
		this_el.attr("style", "background-color: #19543E; color: white; border-color: black; border-radius: 8px; border-width: 2px;");
		this_parent.children().each(function (index, elem) {
			//var elem_id = this.getAttribute("id");
			var elem_id = this.childNodes.item(0).textContent;
			if (elem_id != userId) {
				this.children.item(1).setAttribute("style", "background-color: white; color: black; border-color: white;");
			}
		});
	},
	/**
	 * выбор роли в списке
	 * @param {any} roleId
	 */
	selectRole: function (roleId) {
		o_page_UserRoles.chosen_role = roleId;
		var this_el = this.jq_roles_List.find('#' + roleId);
		var this_parent = this_el.parent().parent();
		this_el.attr("style", "background-color: #001747; color: white; border-color: black; border-radius: 8px; border-width: 2px;");
		this_parent.children().each(function (index, elem) {
			var elem_id = this.childNodes.item(0).textContent;
			if (elem_id != roleId) {
				this.children.item(1).setAttribute("style", "background-color: white; color: black; border-color: white;");
			}
		});
	}
}
