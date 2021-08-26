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

                if (err.status === 400) {
                    $("#error").html("Error - you must enter valid credentials.");
                }
                else if (err.status === 401) {
                    $("#error").html("Error - name or password is incorrect.");
                }

                $("#error").show();
            },
            success: function () {
                window.location.reload();
            },
        });
    }

    return false;
});