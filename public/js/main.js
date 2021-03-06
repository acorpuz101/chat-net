var socket = io();
var uploader = new SocketIOFileUpload(socket);

class ChatFunctions {
  constructor() {
    this.socket = io();
    this.username = "";
    this.form = document.getElementById('form');
    this.input = document.getElementById('input');
    this.usersDom = document.getElementById("users");
    this.messages = document.getElementById("messages");
    this.fileInput = document.getElementById("siofu_input");
    this.fileIcon = document.getElementById("siofuIcon");
    this.formSubmit = document.getElementById("formSubmit");
  }

  addToUsersBox(userName) {
    if (!!document.querySelector(`.${userName}-userlist`)) {
      return;
    }

    const userBox = `
      <div class="chat_ib ${userName}-userlist">
        <p class="userName">${userName}</p>
      </div>
    `;
    chatFunctions.usersDom.innerHTML += userBox;
  };

  addCurrentUserToUsersBox(userName) {
    if (!!document.querySelector(`.${userName}-userlist`)) {
      return;
    }

    const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <p class="userName">${userName}</p><btn class="btn btn-primary btn-sm" id="changeUserName" type="button" data-bs-toggle="modal" data-bs-target="#settingsModal"><i class="fas fa-cog fa-lg"></i></btn>
    </div>
  `;
    this.usersDom.innerHTML += userBox;
  };

  change() {
    const oldUserName = this.username;
    const newUserName = document.querySelector(`#currentUserInput`).value;
    this.username = newUserName;
    socket.emit("change user name", oldUserName, newUserName);
  }

  fileChange() {
    const fileInputValue = this.fileInput.value;
    console.log("fileChange", fileInputValue);
  }

  changeUserName(oldUserName, newUserName) {
    const userLabel = document.querySelector(`.${oldUserName}-userlist`);
    userLabel.className = `chat_ib ${newUserName}-userlist`;
    userLabel.innerHTML = `<p class="userName">${newUserName}</p>`
  }

  changeCurrentUserName(oldUserName, newUserName) {
    const userLabel = document.querySelector(`.${oldUserName}-userlist`);
    userLabel.className = `chat_ib ${newUserName}-userlist`;
    userLabel.innerHTML = `<p class="userName">${newUserName}</p><btn class="btn btn-primary btn-sm" id="changeUserName" type="button" data-bs-toggle="modal" data-bs-target="#settingsModal"><i class="fas fa-cog fa-lg"></i></btn>`
  }

  newUserConnected(user) {
    this.username = user || `User${Math.floor(Math.random() * 1000000)}`;
    socket.emit("new user", this.username);
    this.addCurrentUserToUsersBox(this.username);
  };

  toggleFileIcon() {
    if(chatFunctions.fileInput.value == ""){
      this.clearFileInput();
    }else{
      this.fileIcon.classList.add("hasFile");
    }
  }

  clearFileInput(){
    this.fileInput.value = "";
    this.fileIcon.classList.remove("hasFile");
  }

  clearTextInput(){
    this.input.value = "";
  }
}

const chatFunctions = new ChatFunctions();

// new user is created so we generate nickname and emit event
chatFunctions.newUserConnected();

uploader.listenOnSubmit(chatFunctions.formSubmit, chatFunctions.fileInput);

document.getElementById("form").addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    chatFunctions.socket.emit('chat message', chatFunctions.username, input.value);
    input.value = '';
  }
  const filePath = chatFunctions.fileInput.value
  if (filePath != "") {
    const fileName = filePath.split("\\").pop();
    chatFunctions.socket.emit("fileSent", chatFunctions.username, fileName);
    chatFunctions.clearFileInput();
  }
});

document.getElementById("siofu_input").addEventListener('change', function (e) {
  e.preventDefault();
  chatFunctions.toggleFileIcon();
});

document.getElementById("cancelFormInput").addEventListener('click', function (e) {
  e.preventDefault();
  chatFunctions.clearFileInput();
  chatFunctions.clearTextInput();
});

document.getElementById("changeUserName").addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById("currentUserInput").focus();
});

document.getElementById("nameChangeForm").addEventListener('submit', function (e) {
  e.preventDefault();
  chatFunctions.change();
  document.getElementById("nameChangeClose").click();
});

socket.on('chat message', function (msg) {
  var item = document.createElement('li');
  item.innerHTML = msg;
  chatFunctions.messages.appendChild(item);
  document.querySelector("#messages > li:last-child").scrollIntoView();
});

socket.on("new user", function (data) {
  data.map((user) => chatFunctions.addToUsersBox(user.userName));
});

socket.on("user disconnected", function (userName) {
  console.log('disconn', userName);
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("change user name", function (oldUserName, newUserName) {
  (chatFunctions.username == newUserName) ? chatFunctions.changeCurrentUserName(oldUserName, newUserName) : chatFunctions.changeUserName(oldUserName, newUserName);
});

socket.on('imageConversionByServer', function (data) {
  let img = document.createElement('img');
  img.setAttribute("src", data);
  img.setAttribute("width", "200");

  var item = document.createElement('li');
  item.appendChild(img);
  chatFunctions.messages.appendChild(item);
});
