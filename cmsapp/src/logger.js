// Logger Module - Centralized logging with levels
class Logger {
  constructor(name = 'CMS') {
    this.name = name;
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = this.levels.INFO;
  }

  format(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.name}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  error(message, data) {
    console.error(this.format('ERROR', message, data));
  }

  warn(message, data) {
    if (this.currentLevel >= this.levels.WARN) {
      console.warn(this.format('WARN', message, data));
    }
  }

  info(message, data) {
    if (this.currentLevel >= this.levels.INFO) {
      console.log(this.format('INFO', message, data));
    }
  }

  debug(message, data) {
    if (this.currentLevel >= this.levels.DEBUG) {
      console.log(this.format('DEBUG', message, data));
    }
  }
}

// Decorator: Log method execution
export function LogExecution(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  const logger = new Logger(target.constructor.name);

  descriptor.value = async function(...args) {
    const startTime = Date.now();
    logger.info(`Executing ${propertyKey}`, { args: args.slice(0, 2) });
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.debug(`${propertyKey} completed`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      logger.error(`${propertyKey} failed`, { error: error.message });
      throw error;
    }
  };

  return descriptor;
}

// Decorator: Cache results
export function CacheResult(ttl = 3600000) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    const cache = new Map();
    const logger = new Logger('Cache');

    descriptor.value = async function(...args) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < ttl) {
          logger.debug(`Cache hit for ${propertyKey}`);
          return cached.value;
        }
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, { value: result, timestamp: Date.now() });
      logger.debug(`Cache miss for ${propertyKey}, cached result`);
      
      return result;
    };

    return descriptor;
  };
}

// Decorator: Validate input
export function ValidateInput(validator) {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    const logger = new Logger('Validation');

    descriptor.value = async function(...args) {
      try {
        validator(args[0]);
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.error(`Validation failed for ${propertyKey}`, { error: error.message });
        throw new Error(`Invalid input: ${error.message}`);
      }
    };

    return descriptor;
  };
}

export default Logger;
