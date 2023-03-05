import {
  Box, Button, Card, CardActions, CardContent, Collapse, Rating,
  Typography, useMediaQuery, useTheme
} from '@mui/material'
import React, { useState } from 'react'

import { useGetProductsQuery } from 'state/api'

import Header from 'components/Header'

const Product = ( { product } ) => {
  const theme = useTheme()

  const [ isExpanded, setIsExpanded ] = useState( false )

  return (
    <Card
      sx={{
        backgroundImage: 'none',
        bgcolor: theme.palette.background.alt,
        borderRadius: '0.55rem',
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }}
          color={theme.palette.secondary[ 700 ]} gutterBottom>
          {product.category}
        </Typography>
        <Typography variant='h5' component='div'>
          {product.name}
        </Typography>
        <Typography sx={{ md: '1.5rem' }} color={theme.palette.secondary[ 400 ]} >
          $ {Number( product.price ).toFixed( 2 )}
        </Typography>
        <Rating value={product.rating} readOnly />
        <Typography variant='body2' >
          {product.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant='primary' size='small'
          onClick={() => setIsExpanded( !isExpanded )}
        >
          See More
        </Button>
      </CardActions>
      <Collapse
        in={isExpanded}
        timeout='auto'
        unmountOnExit
        sx={{
          color: theme.palette.neutral[ 300 ],
        }}
      >
        <CardContent>
          <Typography>id: {product._id}</Typography>
          <Typography>Supply: {product.supply}</Typography>
          <Typography>Yearly Sales: {product.stats.yearlySalesTotal}</Typography>
          <Typography>Yearly Units Sold: {product.stats.yearlyTotalSoldUnits}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}

const Products = () => {

  const { data, isLoading } = useGetProductsQuery()
  const isNonMobile = useMediaQuery( '(min-width: 1000px)' )

  return (
    <Box m='1.5rem 2.5rem'>
      <Header title='Products' subtitle='List of Products' />
      {data || !isLoading ? (
        <Box
          mt='20px'
          display='grid'
          gridTemplateColumns='repeat(4,minmax(0,1fr))'
          justifyContent='space-between'
          rowGap='20px'
          columnGap='1.33%'
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : 'span 4' },
          }}
        >
          {data.map( p => ( <Product key={p._id} product={p} /> ) )}
        </Box>
      ) :
        ( <>Loading...</> )}
    </Box>
  )
}

export default Products