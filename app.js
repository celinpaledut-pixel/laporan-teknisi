const API = "https://script.google.com/macros/s/AKfycbzOk6RgxwsbLJJ7bdq2mYJ_HflG7CjJmod66d-aqhEq/dev";

async function kirim() {
  const data = {
    nama: val("nama"),
    tanggal: val("tanggal"),
    lokasi: val("lokasi"),
    pekerjaan: val("pekerjaan"),
    deskripsi: val("deskripsi"),
    status: val("status")
  };

  if (!data.nama || !data.tanggal) {
    alert("Nama & tanggal wajib!");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    const json = JSON.parse(text);

    if (json.status === "success") {
      alert("Berhasil kirim!");
      loadData();
      clearForm();
    } else {
      alert("Error: " + json.message);
    }

  } catch (err) {
    console.error(err);
    alert("Koneksi gagal / API tidak bisa diakses");
  }
}
