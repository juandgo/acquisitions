import logger from '#config/logger.js';
import { signupSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { jwttoken } from '#utils/jwt.js';

export const signup = async (req, res, next) => {
  console.log('BODY:', req.body);
  try{
    const validationResult = signupSchema.safeParse(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        error: 'Validation failed', 
        details: formatValidationErrors(validationResult.error)
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({name, email, password, role });
    
    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User registered succesfully: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role}
    });

  }catch(e){
    logger.error('Signup error', e);
    // if(e.message === 'User with this email already exists'){
    //   return res.status(409).json({error: 'Email already in use'});
    // }
    return res.status(e.message === 'User with this email already exists' ? 409 : 500)
      .json({ error: e.message });
    // next(e);
  }

};