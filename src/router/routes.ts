export const ROUTES = {
  Root: '/',
  Login: '/login',
  Home: {
    Root: '/home',
  },
  Work: {
    Root: '/work',
    Filmography: {
      Root: '/work/filmography',
      AddEdit: '/work/filmography/addEdit/:id',
      Detail: '/work/filmography/detail/:id',
    },
    Literature: {
      Root: '/work/literature',
      AddEdit: '/work/literature/addEdit/:id',
      Detail: '/work/literature/detail/:id',
    },
  },
  Contract: {
    Root: '/contract',
    IPContracts: {
      Root: '/contract/ipContracts',
      AddEdit: '/contract/ipContracts/addEdit/:id/:status',
      Detail: '/contract/ipContracts/detail/:id/:detailType',
      Supplemental: '/contract/ipContracts/supplemental/:id',
    },
    IssuanceContract: {
      Root: '/contract/issuanceContract',
      AddEdit: '/contract/issuanceContract/addEdit/:id/:status',
      Detail: '/contract/issuanceContract/detail/:id/:detailType',
      Supplemental: '/contract/issuanceContract/supplemental/:id',
    },
    WarehouseContracts: {
      CustomizedContract: {
        Root: '/contract/customizedContract',
        AddEdit: '/contract/customizedContract/addEdit/:id/:status',
        Detail: '/contract/customizedContract/detail/:id/:detailType',
        Supplemental: '/contract/customizedContract/supplemental/:id',
      },
      JointInvestmentContract: {
        Root: '/contract/jointInvestmentContract',
        AddEdit: '/contract/jointInvestmentContract/addEdit/:id/:status',
        Detail: '/contract/jointInvestmentContract/detail/:id/:detailType',
        Supplemental: '/contract/jointInvestmentContract/supplemental/:id',
      },
      CoProductionContract: {
        Root: '/contract/coProductionContract',
        AddEdit: '/contract/coProductionContract/addEdit/:id/:status',
        Detail: '/contract/coProductionContract/detail/:id/:detailType',
        Supplemental: '/contract/coProductionContract/supplemental/:id',
      },
      PurchaseContract: {
        Root: '/contract/purchaseContract',
        AddEdit: '/contract/purchaseContract/addEdit/:id/:status',
        Detail: '/contract/purchaseContract/detail/:id/:detailType',
        Supplemental: '/contract/purchaseContract/supplemental/:id',
      },
      IntroductionContract: {
        Root: '/contract/introductionContract',
        AddEdit: '/contract/introductionContract/addEdit/:id/:status',
        Detail: '/contract/introductionContract/detail/:id/:detailType',
        Supplemental: '/contract/introductionContract/supplemental/:id',
      },
      AgencyContract: {
        Root: '/contract/agencyContract',
        AddEdit: '/contract/agencyContract/addEdit/:id/:status',
        Detail: '/contract/agencyContract/detail/:id/:detailType',
        Supplemental: '/contract/agencyContract/supplemental/:id',
      },
      OffsetContract: {
        Root: '/contract/offsetContract',
        AddEdit: '/contract/offsetContract/addEdit/:id/:status',
        Detail: '/contract/offsetContract/detail/:id/:detailType',
        Supplemental: '/contract/offsetContract/supplemental/:id',
      },
    },
  },
  HomemadeDrama: {
    Root: '/homemadeDrama',
    Management: {
      Root: '/homemadeDrama/management',
      AddEdit: '/homemadeDrama/management/addEdit/:id/:status',
      Detail: '/homemadeDrama/management/detail/:id/:detailType',
    },
  },
};
