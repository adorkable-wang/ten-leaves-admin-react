export const ROUTES = {
  Contract: {
    IPContracts: {
      AddEdit: '/contract/ipContracts/addEdit/:id/:status',
      Detail: '/contract/ipContracts/detail/:id/:detailType',
      Root: '/contract/ipContracts',
      Supplemental: '/contract/ipContracts/supplemental/:id'
    },
    IssuanceContract: {
      AddEdit: '/contract/issuanceContract/addEdit/:id/:status',
      Detail: '/contract/issuanceContract/detail/:id/:detailType',
      Root: '/contract/issuanceContract',
      Supplemental: '/contract/issuanceContract/supplemental/:id'
    },
    Root: '/contract',
    WarehouseContracts: {
      AgencyContract: {
        AddEdit: '/contract/agencyContract/addEdit/:id/:status',
        Detail: '/contract/agencyContract/detail/:id/:detailType',
        Root: '/contract/agencyContract',
        Supplemental: '/contract/agencyContract/supplemental/:id'
      },
      CoProductionContract: {
        AddEdit: '/contract/coProductionContract/addEdit/:id/:status',
        Detail: '/contract/coProductionContract/detail/:id/:detailType',
        Root: '/contract/coProductionContract',
        Supplemental: '/contract/coProductionContract/supplemental/:id'
      },
      CustomizedContract: {
        AddEdit: '/contract/customizedContract/addEdit/:id/:status',
        Detail: '/contract/customizedContract/detail/:id/:detailType',
        Root: '/contract/customizedContract',
        Supplemental: '/contract/customizedContract/supplemental/:id'
      },
      IntroductionContract: {
        AddEdit: '/contract/introductionContract/addEdit/:id/:status',
        Detail: '/contract/introductionContract/detail/:id/:detailType',
        Root: '/contract/introductionContract',
        Supplemental: '/contract/introductionContract/supplemental/:id'
      },
      JointInvestmentContract: {
        AddEdit: '/contract/jointInvestmentContract/addEdit/:id/:status',
        Detail: '/contract/jointInvestmentContract/detail/:id/:detailType',
        Root: '/contract/jointInvestmentContract',
        Supplemental: '/contract/jointInvestmentContract/supplemental/:id'
      },
      OffsetContract: {
        AddEdit: '/contract/offsetContract/addEdit/:id/:status',
        Detail: '/contract/offsetContract/detail/:id/:detailType',
        Root: '/contract/offsetContract',
        Supplemental: '/contract/offsetContract/supplemental/:id'
      },
      PurchaseContract: {
        AddEdit: '/contract/purchaseContract/addEdit/:id/:status',
        Detail: '/contract/purchaseContract/detail/:id/:detailType',
        Root: '/contract/purchaseContract',
        Supplemental: '/contract/purchaseContract/supplemental/:id'
      }
    }
  },
  Home: {
    Root: '/home'
  },
  HomemadeDrama: {
    Management: {
      AddEdit: '/homemadeDrama/management/addEdit/:id/:status',
      Detail: '/homemadeDrama/management/detail/:id/:detailType',
      Root: '/homemadeDrama/management'
    },
    Root: '/homemadeDrama'
  },
  Login: '/login',
  Root: '/',
  Work: {
    Filmography: {
      AddEdit: '/work/filmography/addEdit/:id',
      Detail: '/work/filmography/detail/:id',
      Root: '/work/filmography'
    },
    Literature: {
      AddEdit: '/work/literature/addEdit/:id',
      Detail: '/work/literature/detail/:id',
      Root: '/work/literature'
    },
    Root: '/work'
  }
};
