/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import { ROUTES } from "../constants/routes.js";
import mockedBills from "../__mocks__/store.js";
//---------

import userEvent from "@testing-library/user-event";

import { handleChangeFile } from "../containers/NewBill.js";

// Fonction de navigation pour rediriger
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  let fileInput; // Déclaration ici pour qu'il soit accessible dans tous les tests
  let newBill; // Déclarer newBill globalement aussi

  // beforeAll(() => {
  //   Object.defineProperty(window, "localStorage", {
  //     value: localStorageMock,
  //   });
  //   window.localStorage.setItem(
  //     "user",
  //     JSON.stringify({
  //       type: "Employee",
  //     })
  //   );
  // });
  // beforeEach(() => {
  //   document.body.innerHTML = NewBillUI(); // Ajoute le HTML attendu au document
  //   fileInput = screen.getByTestId("file");
  //   newBill = new NewBill({
  //     // Instanciation de newBill pour tous les tests
  //     document,
  //     onNavigate,
  //     store,
  //     localStorage: window.localStorage,
  //   });
  // });

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

      console.log("AFTER fireEvent.change :", fileInput.files);
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
  });

  // describe("When I am on NewBill Page", () => {
  //   test("Then navigating should update the document body", () => {
  //     onNavigate("/new-bill");
  //     expect(document.body.innerHTML).toContain("Billed"); // Remplace par un texte visible dans NewBillUI()
  //   });
  //   test("Then NewBill should be initialized with correct properties and eventListeners", () => {
  //     const newBill = new NewBill({
  //       document,
  //       onNavigate,
  //       store,
  //       localStorage: window.localStorage,
  //     });

  //     expect(newBill.document).toEqual(document);
  //     expect(newBill.onNavigate).toBe(onNavigate);
  //     expect(newBill.store).toBe(store);
  //     expect(newBill.fileUrl).toBeNull();
  //     expect(newBill.fileName).toBeNull();
  //     expect(newBill.billId).toBeNull();
  //   });
  //   // test("Then ...", () => {
  //   //   const html = NewBillUI();
  //   //   document.body.innerHTML = html;
  //   //   //to-do write assertion
  //   // });
  // });
});
