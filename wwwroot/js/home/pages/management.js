const userLoad = progress("#user-list-card", true);
const sessionLoad = progress("#session-list-card", true);

function deleteUser(id, name) {
    snackbar(`Deleting user: ${name}, please wait...`);
    userLoad.show();

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
            userLoad.hide();
        },
    });
}

function toggleBlockUser(id, name, status) {
    snackbar(`${status ? "Blocking" : "Unblocking"} user: ${name}, please wait...`);
    userLoad.show();

    return $.ajax({
        url: "/api/user/update",
        type: "PATCH",
        data: JSON.stringify({ "user_id": id, "blocked": status }),
        success: function () {
            snackbar(`Successfully ${status ? "blocked" : "unblocked"} user ${name}!`);
        },
        error: function (xhr) {
            snackbar(xhr.responseText, 1500);
        },
        complete: function () {
            userLoad.hide();
        },
    });
}

function loadUsers(identity) {
    $.post("/api/user/list", function (data) {
        let delay = 50;

        userLoad.hide();

        data.forEach(function (user) {
            const clone = $("#ul-user").clone(), localuser = user.UserId === identity.UserId;
            clone.attr("data-user-id", user.UserId);
            clone.find("#ul-user-name").html(!localuser ? user.Username : `${user.Username} (you)`);

            const update = () => clone.find("#ul-user-btn-block-icon").html(`${user.Disabled ? "how_to_reg" : "block"}`);

            if (localuser) {
                clone.find("#ul-user-btn-delete").attr("disabled", true);
                clone.find("#ul-user-btn-block").attr("disabled", true);
            }

            clone.find("#ul-user-btn-delete").click(function () {
                if (userLoad.busy) return;
                deleteUser(user.UserId, user.Username);
            });

            clone.find("#ul-user-btn-block").click(function () {
                if (userLoad.busy) return;

                toggleBlockUser(user.UserId, user.Username, !user.Disabled).then(function () {
                    user.Disabled = !user.Disabled;
                    update();
                });
            });

            update();
            clone.hide();
            clone.appendTo("#user-list");

            setTimeout(function () {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });
    });
}

function revokeSession(id) {
    snackbar(`Revoking session: ${id}, please wait...`);
    sessionLoad.show();

    return $.ajax({
        url: "/api/session/revoke",
        type: "POST",
        data: JSON.stringify({ "session_id": id }),
        success: function () {
            $("ul").find(`[data-session-id="${id}"]`).remove();
        },
        error: function (xhr) {
            snackbar(xhr.responseText, 1500);
        },
        complete: function () {
            sessionLoad.hide();
        },
    });
}

function loadSessions(identity) {
    $.post("/api/session/list", function (data) {
        let delay = 50;

        sessionLoad.hide();

        data.forEach(function (session) {
            const clone = $("#ul-session").clone(), localsession = session.SessionId === identity.SessionId;
            clone.attr("data-session-id", session.SessionId);
            clone.attr("title", session.SessionId);
            clone.find("#ul-session-name").html(!localsession ? session.Username : `${session.Username} (current)`);
            clone.find("#ul-session-creation").html(new Date(session.CreationDate).toLocaleString());

            if (session.UserId === 1 && session.UserId !== identity.UserId) {
                clone.find("#ul-session-btn-revoke").attr("disabled", true);
            }

            clone.find("#ul-session-btn-revoke").click(function () {
                if (sessionLoad.busy) return;

                revokeSession(session.SessionId).then(function () {
                    if (localsession) window.location.reload();
                });
            });

            clone.hide();
            clone.appendTo("#session-list");

            setTimeout(function () {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });
    });
}

$.post("/api/user/identity", function (data) {
    loadUsers(data);
    loadSessions(data);
});