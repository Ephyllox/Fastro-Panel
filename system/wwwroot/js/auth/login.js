$("#login").submit(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", "disabled");

        $.post("/api/validate-login",
            JSON.stringify({
                username: username,
                password: password,
            })
        ).done(function () {
            window.location.reload();
        }).fail(function (err) {
            $("#sendlogin").removeAttr("disabled");
            $("#error").html(`Error - ${err.responseText}`);
            $("#error").hide().fadeIn();
        });
    }

    return false;
});