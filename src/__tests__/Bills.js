/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import { handleClickNewBill } from "../containers/Bills.js";
import { getBills } from "../containers/Bills.js";
import store from "../app/Store.js";
import { formatDate, formatStatus } from "../app/format.js";

// Simule la fonction formatDate et formatStatus pour les tests
jest.mock("../app/format.js", () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
  });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.id).toBe("layout-icon1");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  //-------------------MES TESTS------------------
  describe("When I click on the New bill button", () => {
    test("Then I should be redirected to new bill form", () => {
      // Charger le HTML initial avec les factures
      document.body.innerHTML = BillsUI({ data: bills });

      // Fonction de navigation pour rediriger
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Créer une instance de Bills avec les dépendances nécessaires
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage,
      });

      // Sélectionner le bouton "New Bill"
      const newBillButton = screen.getByTestId("btn-new-bill");

      // Ajouter un eventListener à ce bouton qui appelle handleClickNewBill de l'instance de Bills
      newBillButton.addEventListener("click", () =>
        billsInstance.handleClickNewBill()
      );

      // Simuler le clic sur le bouton
      userEvent.click(newBillButton);

      // Vérifier que la fonction a été appelée et que la redirection se fait vers le formulaire de facture
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // Ton test pour getBills

  describe("When I click on the eye icon", () => {
    test("Then it should open a modal with the correct image", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      // Simule la fonction onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Initialisation requise pour configurer les écouteurs d'événements sur les icônes d'œil
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Simule l'affichage de la modale
      $.fn.modal = jest.fn();

      // Sélectionne la première icône d'œil
      const eyeIcon = screen.getAllByTestId("icon-eye")[0];

      // Définit la fonction de gestion du clic sur l'icône d'œil
      const handleClickIconEye = jest.fn(
        billsInstance.handleClickIconEye(eyeIcon)
      );

      // Ajoute l'écouteur d'événement de clic à l'icône d'œil
      eyeIcon.addEventListener("click", handleClickIconEye);

      // Simule le clic sur l'icône d'œil
      fireEvent.click(eyeIcon);

      // Vérifie si la modale a bien été appelée
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });
});

describe("Bills", () => {
  let billsInstance;

  beforeEach(() => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // Simuler le store et bills
    billsInstance = new Bills({
      document,
      onNavigate,
      store: {
        bills: jest.fn().mockReturnValue({
          list: jest.fn(), // On s'assure que 'list' est une fonction mockée
        }),
      },
      localStorage,
    });
  });

  test("devrait transformer correctement les factures", async () => {
    const snapshot = [
      { date: "2023-01-01", status: "paid", id: 1 },
      { date: "2023-01-02", status: "pending", id: 2 },
    ];

    // Simuler les fonctions de formatage avec un comportement dynamique
    formatStatus.mockImplementation((status) => {
      return status === "paid" ? "paid" : "pending";
    });

    // Simuler la méthode list() pour retourner snapshot
    billsInstance.store.bills().list.mockResolvedValue(snapshot);

    formatDate.mockReturnValue("01/01/2023");

    const bills = await billsInstance.getBills();

    expect(billsInstance.store.bills().list).toHaveBeenCalledTimes(1);
    expect(formatDate).toHaveBeenCalledWith("2023-01-01");
    expect(formatStatus).toHaveBeenCalledWith("paid");
    expect(formatDate).toHaveBeenCalledWith("2023-01-02");
    expect(formatStatus).toHaveBeenCalledWith("pending");

    expect(bills).toEqual([
      {
        date: "2023-01-01",
        status: "paid",
        formatedDate: "01/01/2023",
        id: 1,
      },
      {
        date: "2023-01-02",
        status: "pending",
        formatedDate: "01/01/2023",
        id: 2,
      },
    ]);
  });

  test("devrait logguer une erreur si formatDate échoue", async () => {
    const snapshot = [{ date: "2023-01-01", status: "paid", id: 1 }];

    billsInstance.store.bills().list.mockResolvedValue(snapshot);

    formatDate.mockImplementation(() => {
      throw new Error("invalid-date");
    });

    // Espionner console.log
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await billsInstance.getBills();

    // expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), "for", {
      date: "2023-01-01",
      status: "paid",
      id: 1,
    });

    consoleSpy.mockRestore();
  });
});
