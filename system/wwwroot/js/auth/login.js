$("#login").submit(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    if (username && password && !$("#sendlogin").attr("disabled")) {
        $("#sendlogin").attr("disabled", "disabled");

        $.ajax({
            url: "/api/validate-login",
            type: "post",
            headers: {
                "Username": username,
                "Password": password,
            },
            error: function (err) {
                $("#sendlogin").removeAttr("disabled");
                $("#error").html(`Error - ${err.responseText}`);
                $("#error").hide().fadeIn();
            },
            success: function () {
                window.location.reload();
            },
        });
    }

    return false;
});