import logger from '#config/logger.js';
import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';

export const signup = (req, res, next) => {
  try{
    const validationResult = signupSchema.safeParse(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        error: 'Validation failed', 
        details: formatValidationErrors(validationResult.error)
      });
    }

    const { name, email, role } = validationResult.data;

    // AUTH SERVICE

    logger.info(`User registered succesfully: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: 1, name, email, role }
    });

  }catch(e){
    logger.error('Signup error', e);
    if(e.message === 'User with this email already exists'){
      return res.status(409).json({error: 'Email already in use'});
    }
    next(e);
  }

};