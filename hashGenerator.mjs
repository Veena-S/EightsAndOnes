import jsSHA from 'jssha';

const saltEnvVar = process.env.SALT_ENV_VAR;

/**
 *
 * @param {*} unhashedValueInput - Value to be hashed
 * @param {*} useSalt - Boolean value expected indicating whether
 *                      to append Salt value also to hashed value
 *
 * This function generates the hashed value of the specified value.
 */
export default function generatedHashedValue(unhashedValueInput, useSalt) {
  /**
   * Hashing passwords using jsSHA library
   */
  let unhashedValue = unhashedValueInput;
  if (useSalt)
  {
    unhashedValue += `-${saltEnvVar}`;
  }
  // initialise the SHA object
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(unhashedValue);
  // get the hashed password as output from the SHA object
  const hashedValue = shaObj.getHash('HEX');
  console.log(`UnhashedValue: ${unhashedValue}, HashedValue: ${hashedValue}`);
  return hashedValue;
}
