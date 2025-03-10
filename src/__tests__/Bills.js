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

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
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
    //-------------------MES TESTS------------------
    describe("When I click on the New bill button", () => {
      test("Then I should be redirected to new bill form", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const sampleBills = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const handleClickNewBill = jest.fn(sampleBills.handleClickNewBill);
        const newBillButton = screen.getByTestId("btn-new-bill");
        newBillButton.addEventListener("click", handleClickNewBill);
        userEvent.click(newBillButton);
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    test("Then clicking on the eye icon should open a modal with handleClickIconEye", () => {
      //Mock de la fonction handleClickIconEye
      const handleClickIconEye = jest.fn();
      //Ajout d'une icone dans le DOM
      document.body.innerHTML = `<div data-testid="icon-eye"></div>`;

      //Instanciation de Bills avec la fonction mockée
      const bills = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      //Remplacer la fonction handleClickIconEye
      bills.handleClickIconEye = handleClickIconEye;

      //Recuperation et déclenchement du clic
      const iconEye = screen.getByTestId("icon-eye");
      fireEvent.click(iconEye);

      //Verification de l'appel de la fonction handleClickIconEye
      expect(handleClickIconEye).toHaveBeenCalledWith(iconEye);
    });
  });
});
