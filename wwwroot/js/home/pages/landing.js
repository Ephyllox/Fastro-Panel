const greetings = ["Welcome, $$!", "Nice to see you, $$!", "Hello, $$!"];
const infoLoad = progress("#host-info-card", true);

function toHHMMSS(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const dd = days.toString().padStart(2, "0");
    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    const ss = remainingSeconds.toString().padStart(2, "0");

    return `${dd} day(s), ${hh} hour(s), ${mm} minute(s), ${ss} second(s)`;
}

async function loadHostInfo() {
    $("#svc-host-info-reload").attr("disabled", true);
    infoLoad.show();

    try {
        const data = await resource.api.system.svcHostInfo();
        $("#svc-host-ip").html(`<b>Public IP address:</b> ${data.public_ip || "Retrieval failed!"}`);
        $("#svc-host-hostname").html(`<b>Hostname:</b> ${data.host_name}`);
        $("#svc-host-os").html(`<b>Operating system:</b> ${data.os_info}`);
        $("#svc-host-uptime").html(`<b>System uptime:</b> ${toHHMMSS(data.os_uptime)}`);
        $("#svc-host-date").html(`<b>Date:</b> ${data.host_date}`);

        $("#svc-host-copy-ip").attr("disabled", !data.public_ip);

        $("#svc-host-copy-ip").unbind("click").bind("click", () => {
            navigator.clipboard.writeText(data.public_ip);
            snackbar("Copied the IP address.");
        });
    }
    catch {
        snackbar("Failed to load service host information.");
    }
    finally {
        infoLoad.hide();
        $("#svc-host-info-reload").removeAttr("disabled");
    }
}

$("#svc-host-info-reload").click(loadHostInfo);

resource.api.user.identity().then((data) => {
    const msg = greetings[Math.floor(Math.random() * greetings.length)];

    $("#welcome").html(msg.replace("$$", `<b>${data.Username}</b>`)).fadeIn();
});

loadHostInfo();