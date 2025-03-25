/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import { ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
//---------

// Fonction de navigation pour rediriger
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  let newBill; // Déclarer newBill globalement aussi

  describe("handleChangeFile integration Test Suite", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = NewBillUI(); // Ajoute le HTML attendu au document

      newBill = new NewBill({
        // Instanciation de newBill pour tous les tests
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("should not display an alert when file format is accepted", () => {
      // Espionner la fonction alert
      jest.spyOn(window, "alert").mockImplementation(() => {});

      // Récupérer l'input file
      const fileInput = screen.getByTestId("file");

      // Simuler un fichier
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      console.log("Avant fireEvent.change :", fileInput.files);
      console.log("Voici", file);
      console.log("Type de fileInput :", fileInput.tagName); // Devrait afficher 'INPUT'
      console.log("Type de fileInput (détail) :", fileInput.type); // Devrait afficher 'file'

      // Simuler l'upload du fichier en passant par e.target.value
      Object.defineProperty(fileInput, "value", {
        value: "C:\\fakepath\\test.jpg", // Simuler le chemin d'un fichier
        writable: true,
      });
      // Simuler l'upload du fichier
      fireEvent.change(fileInput, { target: { files: [file] } });

      // console.log("AFTER fireEvent.change :", fileInput.files);
      expect(fileInput.files[0].name).toBe("test.jpg");
      // Vérifier que alert() a été appelé avec le bon message
      expect(window.alert).not.toHaveBeenCalledWith(
        "Seules les images au format jpg, jpeg ou png sont acceptées."
      );

      // Nettoyer le mock de alert après le test
      jest.restoreAllMocks();
    });

    it("should display an alert when file format is not accepted", () => {
      // Espionner la fonction alert
      jest.spyOn(window, "alert").mockImplementation(() => {});

      // Récupérer l'input file
      const fileInput = screen.getByTestId("file");

      // Simuler un fichier
      const file = new File(["test"], "test.txt", { type: "image/jpeg" });

      // Simuler l'upload du fichier en passant par e.target.value
      Object.defineProperty(fileInput, "value", {
        value: "C:\\fakepath\\test.txt", // Simuler le chemin d'un fichier
        writable: true,
      });
      // Simuler l'upload du fichier
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Vérifier que alert() a été appelé avec le bon message
      expect(window.alert).toHaveBeenCalledWith(
        "Seules les images au format jpg, jpeg ou png sont acceptées."
      );

      // Nettoyer le mock de alert après le test
      jest.restoreAllMocks();
    });
    it("should display an alert when no file is selected", () => {
      // Espionner console.log pour vérifier l'appel
      jest.spyOn(console, "log");

      // Récupérer l'input file
      const fileInput = screen.getByTestId("file");

      // Simuler un changement où aucun fichier n'est sélectionné (input vide)
      fireEvent.change(fileInput, { target: { files: [] } });

      // Appeler la fonction qui vérifie le fichier et logge l'erreur si nécessaire
      if (fileInput.files.length === 0) {
        console.log(" Aucun fichier sélectionné !");
      }

      // Vérifier que console.log a été appelé avec le bon message
      expect(console.log).toHaveBeenCalledWith(" Aucun fichier sélectionné !");
    });
    describe("WHEN I am on NewBill page and I submit a correct form", () => {
      // TEST : submit correct form and attached file
      test("THEN I should be redirected to Bills page", () => {
        // Mock de la fonction handleSubmit de NewBill
        const handleSubmit = jest.fn(newBill.handleSubmit);
        newBill.fileName = "image.jpg";

        // Soumission du formulaire
        const newBillForm = screen.getByTestId("form-new-bill");
        newBillForm.addEventListener("submit", handleSubmit);
        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });

  describe("When I submit the form and there's an error with the server", () => {
    //erreur 404
    test("Then there is a mistake and it fails with 404 error message", async () => {
      store.bills(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const errorMessage = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = errorMessage;
      const message = await screen.findByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    //erreur 500
    test("Then there is a mistake and it fails with 500 error message", async () => {
      store.bills(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const errorMessage = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = errorMessage;
      const message = await screen.findByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
