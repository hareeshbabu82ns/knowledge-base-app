import { Box, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

import Header from '../../components/Header'
import { tokens } from '../../theme'
import { useState } from 'react'
import { formatDate } from '@fullcalendar/core'

const Calendar = () => {

  const theme = useTheme()
  const colors = tokens( theme.palette.mode )

  const [ currentEvents, setCurrentEvents ] = useState( [] )

  const handleDateClick = ( selected ) => {
    const title = prompt( 'Please enter event Title' )
    const calendarApi = selected.view.calendar
    calendarApi.unselect()

    if ( title ) {
      calendarApi.addEvent( {
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      } )
    }
  }

  const handleEventClick = ( selected ) => {
    if ( window.confirm( `Are you sure ${selected.event.title}` ) ) {
      selected.event.remove()
    }
  }

  return (
    <Box m='20px'>
      <Header title='Calendar' subtitle='Manage Time' />

      <Box display='flex' justifyContent='space-between'>
        {/* Calendar Sidebar */}
        <Box flex='1 1 20%' bgcolor={colors.primary[ 400 ]}
          p='15px' borderRadius='4px'>
          <Typography variant='h5'>Events</Typography>
          <List>
            {currentEvents.map( e => (
              <ListItem key={e.id}
                sx={{ bgcolor: colors.greenAccent[ 500 ], margin: '10px 0', borderRadius: '2px' }} >
                <ListItemText
                  primary={e.title}
                  secondary={
                    <Typography>
                      {formatDate( e.start, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      } )}
                    </Typography>
                  }
                >
                </ListItemText>
              </ListItem>
            ) )}
          </List>
        </Box>

        {/* Calendar */}
        <Box flex='1 1 100%' ml='15px'>
          <FullCalendar
            height='75vh'
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: 'prev,next,today',
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
            }}
            initialView='dayGridMonth'
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventSet={( events ) => setCurrentEvents( events )}
            initialEvents={[ { id: '1234', title: 'Add day', date: '2023-03-01' } ]}
          />
        </Box>

      </Box>
    </Box>
  )
}

export default Calendar