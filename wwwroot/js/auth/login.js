$("#login").submit(async (e) => {
    const username = $("#username").val();
    const password = $("#password").val();

    e.preventDefault();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", true);
        $("#sendlogin").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.auth.validateLogin("POST", {
                username: username,
                password: password,
            });

            const redirect = query.get("redir_after");
            redirect ? window.location.replace(redirect) : window.location.reload();
        }
        catch (e) {
            $("#password").val("");
            $("#sendlogin").removeAttr("disabled");
            $("#sendlogin").removeClass("progress-bar-striped progress-bar-animated");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }
    }
});

$("#register").submit(async (e) => {
    const username = $("#new-username").val();
    const password = $("#new-password").val();
    const password_confirm = $("#new-password-confirm").val();

    e.preventDefault();

    if (username && password && password_confirm && !$("#sendregister").attr("disabled")) {
        $("#sendregister").attr("disabled", true);
        $("#sendregister").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.auth.register("POST", {
                username: username,
                password: password,
                password_confirm: password_confirm,
            });

            $("#new-username").prop("disabled", true);
            $("#new-password").prop("disabled", true);
            $("#new-password-confirm").prop("disabled", true);
            $("#registration-success").fadeIn();
        }
        catch (e) {
            $("#password").val("");
            $("#sendregister").removeAttr("disabled");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }

        $("#sendregister").removeClass("progress-bar-striped progress-bar-animated");
    }
});