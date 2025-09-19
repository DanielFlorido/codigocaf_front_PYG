import BalanceSheet from "layouts/balance/balance_sheet";
import BalanceParameters from "layouts/balance/balance_parameters";
import SignInIllustration from "layouts/authentication/sign-in/illustration";

// @mui icons
import Icon from "@mui/material/Icon";
import BancosParameters from "layouts/balance/bacos_parameters";
import CashBox from "layouts/balance/cash_box";
import AccountType from "layouts/payments/accountType";
import ThirdParty from "layouts/payments/thirdParty";
import ProgrammerPayment from "layouts/payments/programmerPayment";
import ClientLogo from "layouts/config/logoClient";
import PyGSheet from "layouts/P&G/P&G_sheet";

const routes = [
  {
    type: "collapse",
    name: "Balance",
    key: "balance",
    icon: <Icon fontSize="medium">balance</Icon>,
    collapse: [
      {
        name: "General",
        key: "balance-general",
        route: "/balance/balance-general",
        component: <BalanceSheet />,
      },
      {
        name: "PYG",
        key: "PYG",
        route: "/balance/PYG",
        component: <PyGSheet />,
      },
      {
        name: "Parametros Balance",
        key: "balance-parametros",
        route: "/balance/balance-parametros",
        component: <BalanceParameters />,
      },
      {
        name: "Parametros Bancos",
        key: "bancos-parametros",
        route: "/balance/bancos-parametros",
        component: <BancosParameters />,
      },
      {
        name: "Flujo de Caja",
        key: "flujo-caja",
        route: "/balance/flujo-caja",
        component: <CashBox />,
      },
      {
        name: "Tipo Cuenta",
        key: "tipo-cuenta",
        route: "/programador-pagos/tipo-cuenta",
        component: <AccountType />,
      },
      {
        name: "Terceros",
        key: "terceros",
        route: "/programador-pagos/terceros",
        component: <ThirdParty />,
      },
      {
        name: "Programador Pagos",
        key: "Programador-Pagos",
        route: "/programador-pagos/Programador-Pagos",
        component: <ProgrammerPayment />,
      },
      {
        name: "Cliente Logo",
        key: "Cliente-Logo",
        route: "/configuracion/Cliente-Logo",
        component: <ClientLogo />,
      },
    ],
  },
  {
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignInIllustration />,
  },
];

export default routes;
