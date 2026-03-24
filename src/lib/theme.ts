import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '10px',
        fontWeight: '600',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '10px',
            bg: 'white',
            borderColor: 'gray.200',
            _focus: {
              borderColor: 'orange.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)',
            },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: '10px',
            bg: 'white',
            borderColor: 'gray.200',
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'gray.100',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          bg: 'white',
        },
      },
    },
  },
});

export default theme;
