import logger from '#config/logger.js';
import { signupSchema, signInSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { jwttoken } from '#utils/jwt.js';

export const signup = async (req, res, _next) => {
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

export const signin = async (req, res, _next) => {
  console.log('BODY:', req.body);
  try{
    const validationResult = signInSchema.safeParse(req.body);

    if(!validationResult.success){
      return res.status(400).json({
        error: 'Validation failed', 
        details: formatValidationErrors(validationResult.error)
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({email, password});
    
    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role}
    });

  }catch(e){
    logger.error('Signin error', e);
    return res.status(e.message === 'Invalid credentials' ? 401 : 500)
      .json({ error: e.message });
  }
};

export const signout = async (req, res, _next) => {
  try{
    cookies.clear(res, 'token');
    
    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'User signed out successfully'
    });

  }catch(e){
    logger.error('Signout error', e);
    return res.status(500).json({ error: 'Failed to sign out' });
  }
};
