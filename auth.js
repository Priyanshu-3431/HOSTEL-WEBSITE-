
function getUsers(){
  return JSON.parse(localStorage.getItem("users")) || [];
}

function register(){
  let name = regName.value;
  let email = regEmail.value;
  let password = regPassword.value;

  if(!name || !email || !password){
    alert("All fields required");
    return;
  }

  let users = getUsers();
  if(users.find(u=>u.email===email)){
    alert("Email already registered");
    return;
  }

  users.push({name,email,password});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registration successful");
  location.href="login.html";
}

function login(){
  let email = loginEmail.value;
  let password = loginPassword.value;

  let user = getUsers().find(
    u=>u.email===email && u.password===password
  );

  if(!user){
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("currentUser",JSON.stringify(user));
  location.href="dashboard.html";
}

function logout(){
  localStorage.removeItem("currentUser");
  location.href="login.html";
}
// booking.html
function book(){
  const booking = {
    name: document.getElementById("name").value.trim(),
    regNo: document.getElementById("regNo").value.trim(),
    room: document.getElementById("room").value,
    duration: document.getElementById("duration").value,
    amount: document.getElementById("duration").value === "3" ? 13950 : 26900
  };

  if(!booking.name || !booking.regNo || !booking.room || !booking.duration){
    alert("Please fill all booking details");
    return;
  }

  localStorage.setItem("booking", JSON.stringify(booking));
  window.location.href = "payment.html";
}
// dashboard.html
const { jsPDF } = window.jspdf;

/* current user */
const user = JSON.parse(localStorage.getItem("currentUser"));
if(!user){
  location.href = "index.html";
}

/* all receipts */
const receipts = JSON.parse(localStorage.getItem("receipts")) || [];

/* user receipts → latest first → max 12 */
const userReceipts = receipts
  .filter(r => r.email === user.email)
  .reverse()
  .slice(0, 12);

document.getElementById("userEmail").innerText = "Email: " + user.email;

if(userReceipts.length > 0){

  document.getElementById("roomStatus").innerText = "Booked";
  document.getElementById("payStatus").innerText = "Paid";
  document.getElementById("stayDuration").innerText =
    userReceipts[0].duration;

  let html = "";

  userReceipts.forEach((r, i) => {
    html += `
      <div style="border:1px solid #ccc; padding:15px; margin-bottom:15px;">
        <h4>Receipt #${i + 1}</h4>
        <p><b>Name:</b> ${r.name}</p>
        <p><b>Registration No:</b> ${r.regNo}</p>
        <p><b>Room:</b> ${r.room}</p>
        <p><b>Duration:</b> ${r.duration}</p>
        <p><b>Amount Paid:</b> ₹${r.amount}</p>
        <p><b>UTR:</b> ${r.utr}</p>
        <p><b>Date:</b> ${r.date}</p>
        <p><b>Status:</b> ✅ ${r.status}</p>

        <button onclick="downloadPDF(${i})">
          Download PDF
        </button>
      </div>
    `;
  });

  document.getElementById("receiptData").innerHTML = html;

}else{
  document.getElementById("receiptData").innerHTML =
    "<p>No receipts found for this account</p>";
}

/* PDF Download Function */
function downloadPDF(index){
  const r = userReceipts[index];
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("HOSTEL PAYMENT RECEIPT", 20, 20);

  pdf.setFontSize(12);
  pdf.text("", 20, 28);

  pdf.text(`Student Name       : ${r.name}`, 20, 40);
  pdf.text(`Registration No    : ${r.regNo}`, 20, 50);
  pdf.text(`Email              : ${r.email}`, 20, 60);
  pdf.text(`Room Type          : ${r.room}`, 20, 70);
  pdf.text(`Stay Duration      : ${r.duration}`, 20, 80);
  pdf.text(`Amount Paid        : ₹${r.amount}`, 20, 90);
  pdf.text(`UTR / Transaction  : ${r.utr}`, 20, 100);
  pdf.text(`Payment Date       : ${r.date}`, 20, 110);
  pdf.text(`Payment Status     : PAID`, 20, 120);

  pdf.text("------------------------------------------------", 20, 135);
  pdf.text("Authorized Hostel Office", 20, 150);

  pdf.save(`Hostel_Receipt_${index + 1}.pdf`);
}
// payment.html
function pay(){
  const utr = document.getElementById("utr").value.trim();
  if(!utr){
    alert("UTR number is required");
    return;
  }

  const booking = JSON.parse(localStorage.getItem("booking"));
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if(!booking || !user){
    alert("Session expired. Please login again.");
    return;
  }

  const receipt = {
    name: booking.name,
    regNo: booking.regNo,
    room: booking.room,
    duration: booking.duration + " Months",
    amount: booking.amount,
    utr: utr,
    email: user.email,
    date: new Date().toLocaleString(),
    status: "PAID"
  };

  let receipts = JSON.parse(localStorage.getItem("receipts")) || [];
  receipts.push(receipt);
  localStorage.setItem("receipts", JSON.stringify(receipts));

  // clear booking after success
  localStorage.removeItem("booking");

  window.location.href = "dashboard.html";
}


