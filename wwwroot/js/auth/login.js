$("#login").submit(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", "disabled");
        $("#sendlogin").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        $.post("/api/validate-login",
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