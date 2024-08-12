import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu, useProSidebar, sidebarClasses } from 'react-pro-sidebar';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import PieChartOutlinedIcon from '@mui/icons-material/PieChartOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { tokens } from '../../theme';
import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';

const Item = ( { title, to, icon, selected, setSelected } ) => {

  const theme = useTheme()
  const colors = tokens( theme.palette.mode )
  const navigate = useNavigate()

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[ 100 ], backgroundColor: colors.primary[ 400 ], }}
      onClick={() => { setSelected( title ); navigate( to ) }}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  )

}
const Sidebar = () => {
  const theme = useTheme()
  const colors = tokens( theme.palette.mode )

  const { collapseSidebar, toggleSidebar, collapsed, toggled } = useProSidebar()
  const [ selected, setSelected ] = useState( "Dashboard" )

  return (
    <Box
    // sx={{
    //   "& .pro-sidebar-inner":{
    //     background: `${colors.primary[400]} !important`,
    //   },
    //   "& .pro-icon-wrapper":{
    //     backgroundColor: `transparent !important`,
    //   },
    //   "& .pro-inner-item":{
    //     padding: '5px 35px 5px 20px !important',
    //   },
    //   "& .pro-inner-item:hover":{
    //     color: "#868dfb !important",
    //   },
    //   "& .pro-menu-item:active":{
    //     color: "#6870fa !important",
    //   },
    // }}
    >
      <ProSidebar
        backgroundColor={colors.primary[ 400 ]}
        style={{ height: '100vh', borderRightStyle: 'none' }}
        breakPoint='sm'
        transitionDuration={800}
        rootStyles={{
          [ `.${sidebarClasses.collapsed}` ]: {
            backgroundColor: 'transparent',
          },
        }}>
        <Menu
          iconShape='square'
          rootStyles={{
            button: ( { active, disabled } ) => {
              return {
                ":hover": { color: "#868dfb" },
                backgroundColor: active ? '#6870fa' : colors.primary[ 400 ],
              }
            },
          }}
          menuItemStyles={{
            root: () => {
              return {
                ":hover": { color: "#868dfb" },
              }
            },
            // button: ( { active, disabled } ) => {
            //   return {
            //     ":hover": { color: "#868dfb" },
            //     padding: '5px 35px 5px 20px',
            //   }
            // },
          }}
        >
          {/* Logo and Menu Icon */}
          <MenuItem
            onClick={() => collapseSidebar( !collapsed )}
            icon={collapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              // color: colors.grey[100],
              backgroundColor: colors.primary[ 400 ],
            }}
          >
            {!collapsed && (
              <Box display={'flex'} justifyContent='space-between' alignItems={'center'} ml='15px'>
                <Typography variant='h3' color={colors.grey[ 100 ]}>
                  TerabitsIO
                </Typography>
                <IconButton onClick={() => collapseSidebar( !collapsed )}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* User */}
          {!collapsed && (
            <Box mb='25px'>
              <Box display={'flex'} justifyContent='center' alignItems={'center'}>
                <img alt='profile-user' width='100px' height='100px' src={'../../assets/user.png'}
                  style={{ cursor: 'pointer', borderRadius: '50%' }}
                />
              </Box>
              <Box textAlign={'center'}>
                <Typography variant='h2'
                  color={colors.grey[ 100 ]}
                  fontWeight='bold'
                  sx={{ m: '10px 0 0 0' }}>Hareesh Polla</Typography>
                <Typography variant='h5' color={colors.greenAccent[ 500 ]}>CEO</Typography>
              </Box>
            </Box>
          )}
          {/* Menu Items */}

          <Box paddingLeft={collapsed ? undefined : '10%'}>
            <Item
              title="Dashboard"
              to='/dashboard'
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant='h6'
              color={colors.grey[ 300 ]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>

            <Item
              title="Manage Team"
              to='/team'
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Contacts Info"
              to='/contacts'
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Invoice Balances"
              to='/invoices'
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant='h6'
              color={colors.grey[ 300 ]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>

            <Item
              title="Profile"
              to='/profile'
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to='/calendar'
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to='/faq'
              icon={<HelpOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant='h6'
              color={colors.grey[ 300 ]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>


            <Item
              title="Bar Chart"
              to='/bar'
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to='/pie'
              icon={<PieChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to='/line'
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography"
              to='/geography'
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>

          <SubMenu label="Charts">
            <MenuItem> Pie charts </MenuItem>
            <MenuItem> Line charts </MenuItem>
          </SubMenu>
          <MenuItem> Documentation </MenuItem>
          <MenuItem> Calendar </MenuItem>
        </Menu>
      </ProSidebar>
    </Box>
  )
}

export default Sidebar