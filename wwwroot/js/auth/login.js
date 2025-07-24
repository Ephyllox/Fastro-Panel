$("#login").submit(async (e) => {
    const username = $("#username").val();
    const password = $("#password").val();

    e.preventDefault();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", true);
        $("#sendlogin").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            const res = await resource.api.auth.validateLogin("POST", {
                "username": username,
                "password": password,
            });

            const redirect = query.get("redir_after");

            if (res.IncompleteLogin) {
                if (redirect) window.location.replace(resource.verification + `?redir_after=${redirect}`);
                else window.location.replace(resource.verification);
            }
            else {
                redirect ? window.location.replace(redirect) : window.location.reload();
            }
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

$("#verification").submit(async (e) => {
    const code = $("#code").val();
    const bypass = $("#bypass").is(":checked");

    e.preventDefault();

    if (code && !$("#sendverify").attr("disabled")) {
        $("#sendverify").attr("disabled", true);
        $("#sendverify").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.auth.validateMsa("POST", {
                "code": code,
                "temporary_bypass": bypass,
            });

            const redirect = query.get("redir_after");
            redirect ? window.location.replace(redirect) : window.location.reload();
        }
        catch (e) {
            if (e.status === 400 || e.responseText.match(/session expired/i)) return window.location.reload();
            $("#code").val("");
            $("#sendverify").removeAttr("disabled");
            $("#sendverify").removeClass("progress-bar-striped progress-bar-animated");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }
    }
});

$("#logout").click(async () => {
    $("#logout").attr("disabled", true);

    try {
        await resource.api.auth.logout();
        window.location.replace(resource.login);
    }
    catch {
        $("#logout").attr("disabled", false);
    }
});