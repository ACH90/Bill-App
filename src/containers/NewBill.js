import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    console.log("handleChangeFile appelée"); // Vérifie que la fonction s'exécute
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    console.log("Fichier récupéré :", file); // Vérifie si le fichier est bien présent
    console.log("Nom du fichier :", file.name); // Devrait afficher "test.jpg"
    console.log("Type du fichier :", file.type); // Devrait afficher "image/jpeg"

    if (!file) {
      console.log("⚠️ Aucun fichier sélectionné !");
      return;
    }
    const filePath = e.target.value.split(/\\/g);
    console.log("Voici e.target.value", e.target.value);
    console.log("Chemin du fichier :", filePath);
    const fileName = filePath[filePath.length - 1];

    console.log("Nom du fichier :", fileName);

    //Resolution Issue 3

    // Vérification de l'extension du fichier
    const ValidExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.includes(".")
      ? fileName.split(".").pop().toLowerCase()
      : "";

    console.log("Extension du fichier:", fileExtension);
    console.log(file);

    if (!ValidExtensions.includes(fileExtension)) {
      console.log("Type de fichier invalide, on appelle l'alerte");
      window.alert(
        "Seules les images au format jpg, jpeg ou png sont acceptées."
      );
      e.target.value = ""; // Réinitialise l'input file
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
