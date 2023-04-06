$("#login").submit(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", true);
        $("#sendlogin").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        $.post("/api/auth/validate-login",
            JSON.stringify({
                username: username,
                password: password,
            })
        ).done(function () {
            window.location.reload();
        }).fail(function (err) {
            $("#password").val("");
            $("#sendlogin").removeAttr("disabled");
            $("#sendlogin").removeClass("progress-bar-striped progress-bar-animated");
            $("#error").html(`Error - ${err.responseText}`);
            $("#error").hide().fadeIn();
        });
    }

    return false;
});

$("#register").submit(function () {
    const username = $("#new-username").val();
    const password = $("#new-password").val();
    const password_confirm = $("#new-password-confirm").val();

    if (username && password && password_confirm && !$("#sendregister").attr("disabled")) {
        $("#sendregister").attr("disabled", true);
        $("#sendregister").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        $.post("/api/auth/register",
            JSON.stringify({
                username: username,
                password: password,
                password_confirm: password_confirm,
            })
        ).done(function () {
            $("#new-username").prop("disabled", true);
            $("#new-password").prop("disabled", true);
            $("#new-password-confirm").prop("disabled", true);
            $("#registration-success").fadeIn();
        }).fail(function (err) {
            $("#password").val("");
            $("#sendregister").removeAttr("disabled");
            $("#error").html(`Error - ${err.responseText}`);
            $("#error").hide().fadeIn();
        }).always(function () {
            $("#sendregister").removeClass("progress-bar-striped progress-bar-animated");
        });
    }

    return false;
});