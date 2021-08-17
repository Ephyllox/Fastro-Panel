const greetings = ["Hey, $$!", "Welcome, $$!", "Nice to see you, $$!", "What's going on $$?", "What's up, $$?", "Hi, $$!", "Great to have you here, $$!", "Awesome, you're here $$!", "Woah, you're here, $$!", "Pleasure seeing you, $$!"];

$.post("./identity", function (data) {
    data = JSON.parse(data);
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    $("#welcome").html(msg.replace("$$", `<b>${data.Name}</b>`)).fadeIn();
});