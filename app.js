const API = "https://script.google.com/macros/s/AKfycbxl67yrIzvGiDuN8kN_wdgrXMXl1VKcNTZdTTKfUow4gsdxhiV2Wq5gGFq37hOMLudX2w/exec";

function val(id) {
  return document.getElementById(id)?.value || "";
}

// ================= LOGIN =================
async function login() {
  const nama = document.getElementById("loginNama").value;
  const pin = document.getElementById("loginPin").value;

  if (!nama || !pin) {
    alert("Isi semua!");
    return;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action: "login",
      nama,
      pin
    })
  });

  const json = await res.json();

  if (json.status === "success") {
    localStorage.setItem("user", JSON.stringify(json));
    initApp();
  } else {
    alert("Login gagal");
  }
}
function logout() {
  localStorage.removeItem("teknisi");
  location.reload();
}

function initApp() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("appBox").style.display = "block";

  document.getElementById("nama").value = user.nama;

  setTanggalNow();
  loadData();
}

// ================= AUTO TANGGAL =================
function setTanggalNow() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  document.getElementById("tanggal").value = local;
}

// ================= KIRIM =================
function val(id) {
  return document.getElementById(id).value;
}

async function kirim(e) {
  const user = JSON.parse(localStorage.getItem("user"));

  const data = {
    action: "save",
    nama: user.nama,
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  if (json.status === "success") {
    alert("Berhasil");
    loadData();
  }
}

// ================= CLEAR =================
function clearForm() {
  document.getElementById("lokasi").value = "";
  document.getElementById("pekerjaan").value = "";
  document.getElementById("deskripsi").value = "";
}

// ================= LOAD DATA =================
async function loadData() {
  const user = JSON.parse(localStorage.getItem("user"));

  const url = `${API}?nama=${user.nama}&role=${user.role}`;

  const res = await fetch(url);
  const data = await res.json();

  const el = document.getElementById("list");
  el.innerHTML = "";

  data.reverse().forEach(d => {
    el.innerHTML += `
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">

            <div class="d-flex justify-content-between">
              <b>${d.nama}</b>
              <span class="badge ${d.status === 'Selesai' ? 'bg-success' : 'bg-warning'}">
                ${d.status}
              </span>
            </div>

            <small>${d.tanggal}</small>

            <p><b>${d.lokasi}</b> - ${d.pekerjaan}</p>
            <p>${d.deskripsi || '-'}</p>

          </div>
        </div>
      </div>
    `;
  });
}

  } catch (err) {
    console.error(err);
  }
}
// INIT
initApp();
loadData();
