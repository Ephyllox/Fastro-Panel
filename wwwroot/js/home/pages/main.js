let logout = true;

$("#logout").click(function () {
    if (!logout) return;
    logout = false;

    document.querySelector("#logout-toast").MaterialSnackbar.showSnackbar({ message: "Logging out..." });

    $.post("/api/auth/logout", function () {
        window.location.reload();
    });
});

$.post("/api/user/identity", function (data) {
    $("#username-load").fadeOut();

    setTimeout(function () {
        $("#username").html(data.Name).fadeIn();
    }, 250);
});