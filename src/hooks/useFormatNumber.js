import numeral from 'numeral';
import { number } from 'prop-types';
//  hooks
import useLocales from './useLocales';

export default function useFormatNumber() {
  const { currentLang } = useLocales();

  const fCurrency = (number) => {
    let sign = '$';
    if (currentLang.value === 'vn') {
      sign = '';
    }
    return numeral(number).format(Number.isInteger(number) ? `0,0` : `0,0.00`);
  };

  const fPercent = (number) => numeral(number / 100).format('0.0%');

  const fNumber = (number) => numeral(number).format();

  const fShortenNumber = (number) => numeral(number).format('0.00a').replace('.00', '');

  const fData = (number) => numeral(number).format('0.0 b');
  const fCurrencySeparate = (number) => numeral(number).format('0,0');
  const fNumberSeparate = (number) =>
    number
      .toString()
      .replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  numeral.locale(currentLang.value);

  return {
    fCurrency,
    fPercent,
    fNumber,
    fShortenNumber,
    fData,
    fCurrencySeparate,
    fNumberSeparate,
  };
}
