const API = "https://script.google.com/macros/s/AKfycbzZTLMRCOURmqpCUJQ3ilGZTn1iQ1QJN98JbBnkh0ZEolcEpUKQlL0zHvsR5l_x6sf_FA/exec";

function val(id) {
  return document.getElementById(id)?.value || "";
}

async function kirim() {
  console.log("Tombol diklik");

  const data = {
    nama: val("nama"),
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  console.log("DATA:", data);

  if (!data.nama || !data.tanggal) {
    alert("Nama & tanggal wajib!");
    return;
  }

  try {
   const res = await fetch(API, {
  method: "POST",
  headers: {
    "Content-Type": "text/plain;charset=utf-8"
  },
  body: JSON.stringify(data)
});

    const text = await res.text();
    console.log("RESPONSE:", text);

    const json = JSON.parse(text);

    if (json.status === "success") {
      alert("Berhasil kirim!");
      loadData();
      clearForm();
    } else {
      alert("Error: " + json.message);
    }

  } catch (err) {
    console.error("ERROR:", err);
    alert("Koneksi gagal");
  }
}

function clearForm() {
  ["tanggal","lokasi","pekerjaan","deskripsi"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    const el = document.getElementById("list");
    el.innerHTML = "";

    data.reverse().forEach(d => {
      el.innerHTML += `
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">

              <div class="d-flex justify-content-between">
                <h6 class="fw-bold mb-1">${d.nama}</h6>
                <span class="badge ${d.status === 'Selesai' ? 'bg-success' : 'bg-warning'}">
                  ${d.status}
                </span>
              </div>

              <small class="text-muted">${d.tanggal}</small>

              <p class="mb-1 mt-2"><b>Lokasi:</b> ${d.lokasi}</p>
              <p class="mb-1"><b>Pekerjaan:</b> ${d.pekerjaan}</p>
              <p class="mb-0 text-muted">${d.deskripsi || '-'}</p>

            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}
loadData();
