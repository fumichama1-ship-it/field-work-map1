const addButton = document.getElementById("addButton");
const workList = document.getElementById("workList");
const searchInput = document.getElementById("searchInput");
const csvInput = document.getElementById("csvInput");
const routeButton = document.getElementById("routeButton");
let works = JSON.parse(localStorage.getItem("works")) || [];

function saveWorks() {
  localStorage.setItem("works", JSON.stringify(works));
}

function showWorks() {
  workList.innerHTML = "";

  const keyword = searchInput.value;

  works.forEach(function (work, index) {
    if (
      !work.workName.includes(keyword) &&
      !work.address.includes(keyword) &&
      !work.worker.includes(keyword)
    ) {
      return;
    }

    const row = document.createElement("tr");

    const today = new Date().toISOString().split("T")[0];

    if (work.deadline < today && work.status !== "完了") {
      row.classList.add("overdue");
    }

    row.innerHTML = `
      <td>${work.workName}</td>
      <td>${work.address}</td>
      <td>${work.worker}</td>
      <td>${work.deadline}</td>
      <td class="status ${work.status}">${work.status}</td>
      <td>
        <button class="mapButton">地図</button>
        <button class="editButton">編集</button>
        <button class="deleteButton">削除</button>
      </td>
    `;

    const mapButton = row.querySelector(".mapButton");
    const editButton = row.querySelector(".editButton");
    const deleteButton = row.querySelector(".deleteButton");

    mapButton.addEventListener("click", function () {

const note =
`
現場:${work.workName}

担当:${work.worker}

期限:${work.deadline}

状態:${work.status}
`;

localStorage.setItem(
"selectedWork",
JSON.stringify({
address: work.address,
note: note
})
);

const mapUrl =
"https://www.google.com/maps/search/?api=1&query=" +
encodeURIComponent(
work.address +
" " +
work.workName
);

window.open(
mapUrl,
"_blank"
);

});

    editButton.addEventListener("click", function () {
      const newWorker = prompt("担当者変更", work.worker);
      const newDeadline = prompt("期限変更", work.deadline);
      const newStatus = prompt("ステータス変更（未対応/作業中/完了）", work.status);

      if (newWorker && newDeadline && newStatus) {
        works[index].worker = newWorker;
        works[index].deadline = newDeadline;
        works[index].status = newStatus;

        saveWorks();
        showWorks();
      }
    });

    deleteButton.addEventListener("click", function () {
      works.splice(index, 1);
      saveWorks();
      showWorks();
    });

    workList.appendChild(row);
  });
}

addButton.addEventListener("click", function () {
  const workName = document.getElementById("workName").value;
  const address = document.getElementById("address").value;
  const worker = document.getElementById("worker").value;
  const deadline = document.getElementById("deadline").value;
  const status = document.getElementById("status").value;

  if (workName === "" || address === "" || worker === "" || deadline === "") {
    alert("全部入力してください");
    return;
  }

  const work = {
    workName: workName,
    address: address,
    worker: worker,
    deadline: deadline,
    status: status
  };

  works.push(work);
  saveWorks();
  showWorks();

  document.getElementById("workName").value = "";
  document.getElementById("address").value = "";
  document.getElementById("worker").value = "";
  document.getElementById("deadline").value = "";
});

searchInput.addEventListener("input", function () {
  showWorks();
});

csvInput.addEventListener("change", function (event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split("\n");

    rows.shift();

    rows.forEach(function (row) {
      const cols = row.split(",");

      if (cols.length >= 5) {
        const newWork = {
          workName: cols[0].trim(),
          address: cols[1].trim(),
          worker: cols[2].trim(),
          deadline: cols[3].trim(),
          status: cols[4].trim()
        };

        const isDuplicate = works.some(function (work) {
          return (
            work.workName === newWork.workName &&
            work.address === newWork.address &&
            work.deadline === newWork.deadline
          );
        });

        if (!isDuplicate) {
          works.push(newWork);
        }
      }
    });

    saveWorks();
    showWorks();
  };

  reader.readAsText(file);
});
routeButton.addEventListener("click", function () {
  const targetWorks = works.filter(function (work) {
    return work.status !== "完了";
  });

  if (targetWorks.length === 0) {
    alert("未完了の現場がありません");
    return;
  }

  const addresses = targetWorks.map(function (work) {
    return work.address;
  });

  const url =
    "https://www.google.com/maps/dir/" +
    addresses.map(function (address) {
      return encodeURIComponent(address);
    }).join("/");

  window.open(url, "_blank");
});
showWorks();
