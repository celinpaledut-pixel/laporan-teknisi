const API_URL = "https://script.google.com/macros/s/AKfycbwOinLMtkrtu6b2CIXOryRaCt5N84hYwFp0pVAwfcEeenXMRt29LD5dwfNlntBVMJBrlQ/exec";

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

    setTanggalNow();
    loadData();
  } else {
    alert("Login gagal");
  }
}

// ================= AUTO TANGGAL =================
function setTanggalNow() {
  const now = new Date();
  document.getElementById("tanggal").value =
    now.toLocaleDateString() + " " + now.toLocaleTimeString();
}

// ================= SIMPAN =================
async function simpan() {
  const file = document.getElementById("foto").files[0];

  let base64 = "";

  if (file) {
    base64 = await toBase64(file);
  }

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "save",
      nama: user.nama,
      tanggal: document.getElementById("tanggal").value,
      lokasi: document.getElementById("lokasi").value,
      pekerjaan: document.getElementById("pekerjaan").value,
      deskripsi: document.getElementById("deskripsi").value,
      status: "Selesai",
      foto: base64
    })
  });

  loadData();
}

// ================= BASE64 =================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ================= LOAD DATA =================
async function loadData() {
  try {
    const res = await fetch(API_URL + "?nama=" + user.nama);
    const data = await res.json();

    let html = "";

    if (data.length === 0) {
      html = `<div class="alert alert-warning">Belum ada laporan</div>`;
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
                   class="img-fluid mt-2 rounded"
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
      `<div class="alert alert-danger">Gagal load data</div>`;
  }
}

// ================= ZOOM =================
function showImg(src) {
  document.getElementById("modalImg").src = src;
  new bootstrap.Modal(document.getElementById("imgModal")).show();
}
