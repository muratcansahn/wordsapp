import { StyleSheet } from 'react-native';
import {
  FLEX,
  FONT_SIZE,
  LOGO_SIZE,
  MARGIN,
  PADDING,
} from '@/constants/AppConstants';

export const authStyles = StyleSheet.create({
  container: {
    flex: FLEX.one,
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: FLEX.one,
    justifyContent: 'center',
    paddingHorizontal: PADDING.lg,
  },
  imageTitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewContainer: {
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE.md,
    height: LOGO_SIZE.md,
    marginBottom: MARGIN.md,
  },
  title: {
    marginTop: MARGIN.lg,
    marginBottom: MARGIN.xl,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: MARGIN.lg,
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: MARGIN.xl,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
  },
  orText: {
    marginBottom: MARGIN.xl,
    textAlign: 'center',
  },
  linkText: {
    textAlign: 'center',
  },
  termsText: {
    textAlign: 'center',
    marginTop: MARGIN.xl,
  },
  bottomText: {
    marginTop: MARGIN.xl,
  },
  forgotPassword: {
    marginTop: MARGIN.lg,
    alignSelf: 'flex-end',
  },
  alreadyHaveAccount: {
    marginTop: MARGIN.xl,
    textAlign: 'center',
  },
});
