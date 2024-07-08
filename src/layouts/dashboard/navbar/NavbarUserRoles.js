import navConfig from './NavConfig';

const navBarUserRole = (user) => {
  return navConfig.map((group) => ({
    items: group.items.map((item) => {
      let isAuth = false;
      if (user === null || user === undefined) return item;
      if (item.title === 'home') {
        isAuth = user.auth.grantedPolicies?.Report_Dashboard || false;
      } else if (item.title === 'product') {
        isAuth = user.auth.grantedPolicies?.Product_List || false;
      } else if (item.title === 'productNote') {
        isAuth = user.auth.grantedPolicies?.ProductNote_List || false;
      } else if (item.title === 'payment') {
        isAuth = user.auth.grantedPolicies?.FinanaceRequest_List || false;
      } else if (item.title === 'report') {
        isAuth = user.auth.grantedPolicies?.Report_Position || user.auth.grantedPolicies?.Report_Position || false;
        let isChildAuth = false;
        item.children = item.children.map((child) => {
          if (child.title === 'location') {
            isChildAuth = user.auth.grantedPolicies?.Report_Position || false;
          } else if (child.title === 'cashFlow') {
            isChildAuth = user.auth.grantedPolicies?.Report_CashFlow || false;
          } else if (child.title === 'statement') {
            isChildAuth = user.auth.grantedPolicies?.Statement_Management || false;
          } else if (child.title === 'expenseGeneral') {
            isChildAuth = user.auth.grantedPolicies?.Report_GeneralFee || false;
          }
          return {
            ...child,
            isAuth: isChildAuth,
          };
        });
      } else if (item.title === 'pendingApproval') {
        isAuth = user.auth.grantedPolicies?.Approve_Management || true;
      } else if (item.title === 'system') {
        isAuth = user.auth.grantedPolicies?.System_Management || false;
        item.children = item.children.map((child) => {
          return {
            ...child,
            isAuth: true,
          };
        });
      }
      return {
        ...item,
        isAuth,
      };
    }),
  }));
};

export default navBarUserRole;
