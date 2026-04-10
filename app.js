const API_URL = "https://script.google.com/macros/s/AKfycbzIQbxycWIH7Qr_QNsCaY4DxJXQpwRrnsP8GAr3gtDHXTrWLMDQyL_-6AsceSqq1ZILCw/exec"; // <-- WAJIB ISI

let user = {};

// ================= LOGIN =================
async function login() {
  const nama = document.getElementById("nama").value;
  const pin = document.getElementById("pin").value;

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "login", nama, pin })
  });

  const data = await res.json();

  if (data.status === "success") {
    user = data;

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";

    loadData();
  } else {
    alert("Login gagal");
  }
}

// ================= LOAD DATA =================
async function loadData() {
  try {
    const res = await fetch(API_URL + "?nama=" + user.nama);
    const data = await res.json();

    console.log("DATA:", data);

    let html = "";

    if (data.length === 0) {
      html = `<div class="alert alert-warning">Belum ada data</div>`;
    }

    data.forEach(d => {

      html += `
        <div class="card mb-3">
          <div class="card-body">

            <h6>${d.pekerjaan}</h6>
            <small>${d.tanggal} - ${d.lokasi}</small>

            <p>${d.deskripsi}</p>

            <span class="badge bg-${d.approval === 'Approved' ? 'primary' : 'warning'}">
              ${d.approval}
            </span>

            ${d.foto ? `
              <img src="${d.foto}"
                   class="img-fluid mt-2"
                   style="max-height:150px; cursor:pointer;"
                   onclick="showImg('${d.foto}')"
                   onerror="this.style.display='none'">
            ` : ""}

          </div>
        </div>
      `;
    });

    document.getElementById("listData").innerHTML = html;

  } catch (e) {
    document.getElementById("listData").innerHTML =
      `<div class="alert alert-danger">Gagal load</div>`;
  }
}

// ================= SHOW IMG =================
function showImg(src) {
  document.getElementById("modalImg").src = src;
  new bootstrap.Modal(document.getElementById("imgModal")).show();
}
