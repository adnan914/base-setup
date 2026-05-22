import { Dropdown } from "react-bootstrap";
import { logout } from "store/actions/authAction";
import { toggleSideBar } from "store/reducers/layoutReducer";
import { isDialogOpen } from "utils/CommonService";
import { useDispatch, useSelector } from "react-redux";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Button from "@mui/material/Button";
import bell from "assets/images/icons/bell-icon.png";
import quemark from "assets/images/icons/que-mark.png";

const Header = () => {
    const dispatch = useDispatch();
  const { isSideBar } = useSelector((state: any) => state.layout);

  const handleConfirm = () => {
    isDialogOpen.onNext({
      open: true,
      data: {
        message: "Are you sure?",
        title: "Confirmation",
      },
      cancelText: "Cancel",
      confirmText: "Okay",
      onCancel: () => isDialogOpen.onNext(false),
      onConfirm: () => {
        isDialogOpen.onNext(false);
        logout(dispatch);
      },
    });
  };

  const handleSidebar = () => {
    dispatch(toggleSideBar({isSideBar : !isSideBar}));
  };

  return (
    <header className="header">
      <div className="header_logo">
        <div className="logo">
          {/* <img src={logo} alt="logo" /> */}
          Logo
        </div>
        <div className="header_menu">
          <Button variant="text" onClick={handleSidebar}>
            <MenuOutlinedIcon fontSize="small" />
          </Button>
        </div>
      </div>
      <div className="header_bar">
        <span className="aue mr20 pointer">
          <img src={quemark} alt="quemark" />
        </span>
        <span className="notification mr20 pointer">
          <img src={bell} alt="bell" />
        </span>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic" className="toggle_btn">
            <div className="header_drop">
              <span>M</span> Mannan Qureshi
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleConfirm}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
export default Header