showLoading("#user-list-card", true);

function deleteUser(id, name) {
    snackbar(`Deleting user: ${name}, please wait...`);
    showLoading("#user-list-card", true);

    $.ajax({
        url: "/api/user/update",
        type: "DELETE",
        data: JSON.stringify({ "user_id": id }),
        success: function () {
            $("ul").find(`[data-user-id="${id}"]`).remove();
            snackbar(`Successfully deleted user ${name}!`);
        },
        error: function (xhr) {
            snackbar(xhr.responseText, 1500);
        },
        complete: function () {
            hideLoading();
        },
    });
}

function loadUsers(identity) {
    $.post("/api/user/list", function (data) {
        let delay = 50;

        hideLoading();

        data.forEach(function (user) {
            const clone = $("#ul-user").clone(), localuser = user.Name === identity.Name;
            clone.attr("data-user-id", user.UserId);
            clone.find("#ul-user-name").html(!localuser ? user.Name : `${user.Name} (you)`);

            if (localuser) clone.find("#ul-user-btn-delete").attr("disabled", true);

            clone.find("#ul-user-btn-delete").click(function () {
                deleteUser(user.UserId, user.Name);
            });

            clone.hide();
            clone.appendTo("#user-list");

            setTimeout(function () {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });
    });
}

$.post("/api/user/identity", function (data) {
    loadUsers(data);
});