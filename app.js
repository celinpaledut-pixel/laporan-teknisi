const API = "https://script.google.com/macros/s/AKfycby9XiYdOOOvRj828qVvw6dIFSOryNAE-CrvqJdiaO2KWJetaw4Ua_80DdRnpWkF8rXPUA/exec";

// ================= STATE =================
let fotoBase64 = "";

// ================= FOTO =================
function previewFoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt) {
    fotoBase64 = evt.target.result;

    const img = document.getElementById("preview");
    img.src = fotoBase64;
    img.style.display = "block";

    console.log("Foto siap dikirim");
  };

  reader.readAsDataURL(file);
}

// ================= HELPER =================
function val(id) {
  return document.getElementById(id)?.value || "";
}

// ================= LOGIN =================
async function login() {
  const nama = val("loginNama");
  const pin = val("loginPin");

  if (!nama || !pin) {
    alert("Isi semua!");
    return;
  }

  try {
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

  } catch (err) {
    console.error(err);
    alert("Koneksi gagal saat login");
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ================= INIT =================
function initApp() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("appBox").style.display = "block";

  document.getElementById("nama").value = user.nama;

  const roleEl = document.getElementById("roleBadge");
  if (roleEl) roleEl.innerText = user.role;

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
async function kirim(e) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Harus login dulu");
    return;
  }

  if (!fotoBase64) {
    alert("Foto wajib diisi");
    return;
  }

  const btn = e?.target;
  if (btn) {
    btn.innerText = "Mengirim...";
    btn.disabled = true;
  }

  const data = {
    action: "save",
    nama: user.nama,
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status"),
    foto: fotoBase64
  };

  try {
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
      clearForm();
      loadData();
    } else {
      alert("Error: " + json.message);
    }

  } catch (err) {
    console.error(err);
    alert("Koneksi gagal");
  }

  if (btn) {
    btn.innerText = "🚀 Kirim Laporan";
    btn.disabled = false;
  }
}

// ================= CLEAR =================
function clearForm() {
  document.getElementById("lokasi").value = "";
  document.getElementById("pekerjaan").value = "";
  document.getElementById("deskripsi").value = "";

  fotoBase64 = "";

  const img = document.getElementById("preview");
  if (img) img.style.display = "none";
}

// ================= LOAD DATA =================
async function loadData() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const url = `${API}?nama=${user.nama}&role=${user.role}`;

    const res = await fetch(url);
    const data = await res.json();

    const el = document.getElementById("list");
    if (!el) return;

    el.innerHTML = "";

    // ================= DASHBOARD =================
    const total = data.length;
    const selesai = data.filter(d => d.status === "Selesai").length;
    const pending = data.filter(d => d.status === "Pending").length;

    document.getElementById("total").innerText = total;
    document.getElementById("selesai").innerText = selesai;
    document.getElementById("pending").innerText = pending;

    // ================= LIST =================
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

              <small>${d.tanggal || '-'}</small>

              <p class="mb-1"><b>${d.lokasi || '-'}</b> - ${d.pekerjaan || '-'}</p>
              <p class="text-muted">${d.deskripsi || '-'}</p>

              ${d.foto ? `<img src="${d.foto}" class="img-fluid mt-2 rounded">` : ""}

            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

// ================= INIT =================
initApp();
