import { Box, Typography, useTheme } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import Header from '../../components/Header'
import { tokens } from '../../theme'


const FAQ = () => {

  const theme = useTheme()
  const colors = tokens( theme.palette.mode )

  return (
    <Box m='20px'>
      <Header title='FAQ' subtitle='Frequently Asked Questions' />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[ 500 ]} variant='h5'>
            Question 1
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          answer 1
        </AccordionDetails>
      </Accordion>


      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[ 500 ]} variant='h5'>
            Question 2
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          answer 2
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default FAQ