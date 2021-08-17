let logout = true;

$("#logout").click(function () {
    if (!logout) return;
    logout = false;
    document.querySelector("#logout-toast").MaterialSnackbar.showSnackbar({ message: "Logging out..." });

    $.post("./logout", function () {
        window.location.reload();
    });
});

$.post("./identity", function (data) {
    data = JSON.parse(data);
    $("#username-load").hide();
    $("#username").html(data.Name).show();
});