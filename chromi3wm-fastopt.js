'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */

var ScalaJS = {};

// Get the environment info
ScalaJS.env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
ScalaJS.g =
  (typeof ScalaJS.env["global"] === "object" && ScalaJS.env["global"])
    ? ScalaJS.env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
ScalaJS.env["global"] = ScalaJS.g;

// Where to send exports
ScalaJS.e =
  (typeof ScalaJS.env["exportsNamespace"] === "object" && ScalaJS.env["exportsNamespace"])
    ? ScalaJS.env["exportsNamespace"] : ScalaJS.g;
ScalaJS.env["exportsNamespace"] = ScalaJS.e;

// Freeze the environment info
ScalaJS.g["Object"]["freeze"](ScalaJS.env);

// Other fields
ScalaJS.d = {};         // Data for types
ScalaJS.c = {};         // Scala.js constructors
ScalaJS.h = {};         // Inheritable constructors (without initialization code)
ScalaJS.s = {};         // Static methods
ScalaJS.n = {};         // Module instances
ScalaJS.m = {};         // Module accessors
ScalaJS.is = {};        // isInstanceOf methods
ScalaJS.isArrayOf = {}; // isInstanceOfArrayOf methods

ScalaJS.as = {};        // asInstanceOf methods
ScalaJS.asArrayOf = {}; // asInstanceOfArrayOf methods

ScalaJS.lastIDHash = 0; // last value attributed to an id hash code

// Core mechanism

ScalaJS.makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


ScalaJS.makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      ScalaJS.throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
ScalaJS.propertyName = function(obj) {
  var result;
  for (var prop in obj)
    result = prop;
  return result;
};

// Runtime functions

ScalaJS.isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


ScalaJS.throwClassCastException = function(instance, classFullName) {




  throw new ScalaJS.c.sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new ScalaJS.c.jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

ScalaJS.throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  ScalaJS.throwClassCastException(instance, classArrayEncodedName);
};


ScalaJS.noIsInstance = function(instance) {
  throw new ScalaJS.g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

ScalaJS.makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

ScalaJS.newArrayObject = function(arrayClassData, lengths) {
  return ScalaJS.newArrayObjectInternal(arrayClassData, lengths, 0);
};

ScalaJS.newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = ScalaJS.newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

ScalaJS.checkNonNull = function(obj) {
  return obj !== null ? obj : ScalaJS.throwNullPointerException();
};

ScalaJS.throwNullPointerException = function() {
  throw new ScalaJS.c.jl_NullPointerException().init___();
};

ScalaJS.objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

ScalaJS.objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.d.T.getClassOf();
    case "number":
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if (ScalaJS.isByte(v))
          return ScalaJS.d.jl_Byte.getClassOf();
        else if (ScalaJS.isShort(v))
          return ScalaJS.d.jl_Short.getClassOf();
        else
          return ScalaJS.d.jl_Integer.getClassOf();
      } else {
        if (ScalaJS.isFloat(instance))
          return ScalaJS.d.jl_Float.getClassOf();
        else
          return ScalaJS.d.jl_Double.getClassOf();
      }
    case "boolean":
      return ScalaJS.d.jl_Boolean.getClassOf();
    case "undefined":
      return ScalaJS.d.sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        ScalaJS.throwNullPointerException();
      else if (ScalaJS.is.sjsr_RuntimeLong(instance))
        return ScalaJS.d.jl_Long.getClassOf();
      else if (ScalaJS.isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

ScalaJS.objectClone = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new ScalaJS.c.jl_CloneNotSupportedException().init___();
};

ScalaJS.objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

ScalaJS.objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

ScalaJS.objectFinalize = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

ScalaJS.objectEquals = function(instance, rhs) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && ScalaJS.numberEquals(instance, rhs);
  else
    return instance === rhs;
};

ScalaJS.numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

ScalaJS.objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if (ScalaJS.isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();
      else
        return 42; // TODO?
  }
};

ScalaJS.comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      ScalaJS.as.T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      ScalaJS.as.jl_Number(rhs);

      return ScalaJS.m.jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      ScalaJS.asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

ScalaJS.charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["length"]);



  else
    return instance.length__I();
};

ScalaJS.charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

ScalaJS.charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return ScalaJS.as.T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

ScalaJS.booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

ScalaJS.numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
ScalaJS.numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
ScalaJS.numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
ScalaJS.numberLongValue = function(instance) {
  if (typeof instance === "number")
    return ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
ScalaJS.numberFloatValue = function(instance) {
  if (typeof instance === "number") return ScalaJS.fround(instance);
  else                              return instance.floatValue__F();
};
ScalaJS.numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

ScalaJS.isNaN = function(instance) {
  return instance !== instance;
};

ScalaJS.isInfinite = function(instance) {
  return !ScalaJS.g["isFinite"](instance) && !ScalaJS.isNaN(instance);
};

ScalaJS.propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

ScalaJS.systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

ScalaJS.systemIdentityHashCode = function(obj) {
  if (ScalaJS.isScalaJSObject(obj)) {
    var hash = obj["$idHashCode$0"];
    if (hash !== void 0) {
      return hash;
    } else {
      hash = (ScalaJS.lastIDHash + 1) | 0;
      ScalaJS.lastIDHash = hash;
      obj["$idHashCode$0"] = hash;
      return hash;
    }
  } else if (obj === null) {
    return 0;
  } else {
    return ScalaJS.objectHashCode(obj);
  }
};

// is/as for hijacked boxed classes (the non-trivial ones)

ScalaJS.isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

ScalaJS.isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

ScalaJS.isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

ScalaJS.isFloat = function(v) {
  return v !== v || ScalaJS.fround(v) === v;
};


ScalaJS.asUnit = function(v) {
  if (v === void 0)
    return v;
  else
    ScalaJS.throwClassCastException(v, "scala.runtime.BoxedUnit");
};

ScalaJS.asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Boolean");
};

ScalaJS.asByte = function(v) {
  if (ScalaJS.isByte(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Byte");
};

ScalaJS.asShort = function(v) {
  if (ScalaJS.isShort(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Short");
};

ScalaJS.asInt = function(v) {
  if (ScalaJS.isInt(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Integer");
};

ScalaJS.asFloat = function(v) {
  if (ScalaJS.isFloat(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Float");
};

ScalaJS.asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Double");
};


// Unboxes


ScalaJS.uZ = function(value) {
  return !!ScalaJS.asBoolean(value);
};
ScalaJS.uB = function(value) {
  return ScalaJS.asByte(value) | 0;
};
ScalaJS.uS = function(value) {
  return ScalaJS.asShort(value) | 0;
};
ScalaJS.uI = function(value) {
  return ScalaJS.asInt(value) | 0;
};
ScalaJS.uJ = function(value) {
  return null === value ? ScalaJS.m.sjsr_RuntimeLong$().Zero$1
                        : ScalaJS.as.sjsr_RuntimeLong(value);
};
ScalaJS.uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float. 
   */
  return +ScalaJS.asFloat(value);
};
ScalaJS.uD = function(value) {
  return +ScalaJS.asDouble(value);
};






// TypeArray conversions

ScalaJS.byteArray2TypedArray = function(value) { return new Int8Array(value.u); };
ScalaJS.shortArray2TypedArray = function(value) { return new Int16Array(value.u); };
ScalaJS.charArray2TypedArray = function(value) { return new Uint16Array(value.u); };
ScalaJS.intArray2TypedArray = function(value) { return new Int32Array(value.u); };
ScalaJS.floatArray2TypedArray = function(value) { return new Float32Array(value.u); };
ScalaJS.doubleArray2TypedArray = function(value) { return new Float64Array(value.u); };

ScalaJS.typedArray2ByteArray = function(value) {
  var arrayClassData = ScalaJS.d.B.getArrayOf();
  return new arrayClassData.constr(new Int8Array(value));
};
ScalaJS.typedArray2ShortArray = function(value) {
  var arrayClassData = ScalaJS.d.S.getArrayOf();
  return new arrayClassData.constr(new Int16Array(value));
};
ScalaJS.typedArray2CharArray = function(value) {
  var arrayClassData = ScalaJS.d.C.getArrayOf();
  return new arrayClassData.constr(new Uint16Array(value));
};
ScalaJS.typedArray2IntArray = function(value) {
  var arrayClassData = ScalaJS.d.I.getArrayOf();
  return new arrayClassData.constr(new Int32Array(value));
};
ScalaJS.typedArray2FloatArray = function(value) {
  var arrayClassData = ScalaJS.d.F.getArrayOf();
  return new arrayClassData.constr(new Float32Array(value));
};
ScalaJS.typedArray2DoubleArray = function(value) {
  var arrayClassData = ScalaJS.d.D.getArrayOf();
  return new arrayClassData.constr(new Float64Array(value));
};

/* We have to force a non-elidable *read* of ScalaJS.e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = ScalaJS.e;

// Type data constructors

/** @constructor */
ScalaJS.PrimitiveTypeData = function(zero, arrayEncodedName, displayName) {
  // Runtime support
  this.constr = undefined;
  this.parentData = undefined;
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isInstance"] = function(obj) { return false; };
};

/** @constructor */
ScalaJS.ClassTypeData = function(internalNameObj, isInterface, fullName,
                                 parentData, ancestors, isInstance, isArrayOf) {
  var internalName = ScalaJS.propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.constr = undefined;
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.componentData = null;
  this.zero = null;
  this.arrayEncodedName = "L"+fullName+";";
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isPrimitive"] = false;
  this["isInterface"] = isInterface;
  this["isArrayClass"] = false;
  this["isInstance"] = isInstance;
};

/** @constructor */
ScalaJS.ArrayTypeData = function(componentData) {
  // The constructor

  var componentZero = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  if (componentZero == "longZero")
    componentZero = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;

  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new ScalaJS.h.O;
  ArrayClass.prototype.constructor = ArrayClass;
  ArrayClass.prototype.$classData = this;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(this.u.constructor(this.u));
  };

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var componentDepth = componentData.arrayDepth || 0;
  var arrayDepth = componentDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = ScalaJS.d.O;
  this.ancestors = {O: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;
};

ScalaJS.ClassTypeData.prototype.getClassOf = function() {
  if (!this._classOf)
    this._classOf = new ScalaJS.c.jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};

ScalaJS.ClassTypeData.prototype.getArrayOf = function() {
  if (!this._arrayOf)
    this._arrayOf = new ScalaJS.ArrayTypeData(this);
  return this._arrayOf;
};

// java.lang.Class support

ScalaJS.ClassTypeData.prototype["getFakeInstance"] = function() {
  if (this === ScalaJS.d.T)
    return "some string";
  else if (this === ScalaJS.d.jl_Boolean)
    return false;
  else if (this === ScalaJS.d.jl_Byte ||
           this === ScalaJS.d.jl_Short ||
           this === ScalaJS.d.jl_Integer ||
           this === ScalaJS.d.jl_Float ||
           this === ScalaJS.d.jl_Double)
    return 0;
  else if (this === ScalaJS.d.jl_Long)
    return ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
  else if (this === ScalaJS.d.sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};

ScalaJS.ClassTypeData.prototype["getSuperclass"] = function() {
  return this.parentData ? this.parentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["getComponentType"] = function() {
  return this.componentData ? this.componentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["newArrayOfThisClass"] = function(lengths) {
  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return ScalaJS.newArrayObject(arrayClassData, lengths);
};

ScalaJS.PrimitiveTypeData.prototype = ScalaJS.ClassTypeData.prototype;
ScalaJS.ArrayTypeData.prototype = ScalaJS.ClassTypeData.prototype;

// Create primitive types

ScalaJS.d.V = new ScalaJS.PrimitiveTypeData(undefined, "V", "void");
ScalaJS.d.Z = new ScalaJS.PrimitiveTypeData(false, "Z", "boolean");
ScalaJS.d.C = new ScalaJS.PrimitiveTypeData(0, "C", "char");
ScalaJS.d.B = new ScalaJS.PrimitiveTypeData(0, "B", "byte");
ScalaJS.d.S = new ScalaJS.PrimitiveTypeData(0, "S", "short");
ScalaJS.d.I = new ScalaJS.PrimitiveTypeData(0, "I", "int");
ScalaJS.d.J = new ScalaJS.PrimitiveTypeData("longZero", "J", "long");
ScalaJS.d.F = new ScalaJS.PrimitiveTypeData(0.0, "F", "float");
ScalaJS.d.D = new ScalaJS.PrimitiveTypeData(0.0, "D", "double");

// Instance tests for array of primitives

ScalaJS.isArrayOf.Z = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.Z);
ScalaJS.d.Z.isArrayOf = ScalaJS.isArrayOf.Z;

ScalaJS.isArrayOf.C = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.C);
ScalaJS.d.C.isArrayOf = ScalaJS.isArrayOf.C;

ScalaJS.isArrayOf.B = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.B);
ScalaJS.d.B.isArrayOf = ScalaJS.isArrayOf.B;

ScalaJS.isArrayOf.S = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.S);
ScalaJS.d.S.isArrayOf = ScalaJS.isArrayOf.S;

ScalaJS.isArrayOf.I = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.I);
ScalaJS.d.I.isArrayOf = ScalaJS.isArrayOf.I;

ScalaJS.isArrayOf.J = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.J);
ScalaJS.d.J.isArrayOf = ScalaJS.isArrayOf.J;

ScalaJS.isArrayOf.F = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.F);
ScalaJS.d.F.isArrayOf = ScalaJS.isArrayOf.F;

ScalaJS.isArrayOf.D = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.D);
ScalaJS.d.D.isArrayOf = ScalaJS.isArrayOf.D;


// asInstanceOfs for array of primitives
ScalaJS.asArrayOf.Z = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.Z, "Z");
ScalaJS.asArrayOf.C = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.C, "C");
ScalaJS.asArrayOf.B = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.B, "B");
ScalaJS.asArrayOf.S = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.S, "S");
ScalaJS.asArrayOf.I = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.I, "I");
ScalaJS.asArrayOf.J = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.J, "J");
ScalaJS.asArrayOf.F = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.F, "F");
ScalaJS.asArrayOf.D = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.D, "D");


// Polyfills

ScalaJS.imul = ScalaJS.g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

ScalaJS.fround = ScalaJS.g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });

ScalaJS.is.F2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F2)))
});
ScalaJS.as.F2 = (function(obj) {
  return ((ScalaJS.is.F2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Function2"))
});
ScalaJS.isArrayOf.F2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F2)))
});
ScalaJS.asArrayOf.F2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.F2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Function2;", depth))
});
ScalaJS.d.F2 = new ScalaJS.ClassTypeData({
  F2: 0
}, true, "scala.Function2", (void 0), {
  F2: 1
});
/** @constructor */
ScalaJS.c.O = (function() {
  /*<skip>*/
});
/** @constructor */
ScalaJS.h.O = (function() {
  /*<skip>*/
});
ScalaJS.h.O.prototype = ScalaJS.c.O.prototype;
ScalaJS.c.O.prototype.init___ = (function() {
  return this
});
ScalaJS.c.O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
ScalaJS.c.O.prototype.toString__T = (function() {
  var jsx$2 = ScalaJS.objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = ScalaJS.uD((i >>> 0));
  var jsx$1 = x["toString"](16);
  return ((jsx$2 + "@") + ScalaJS.as.T(jsx$1))
});
ScalaJS.c.O.prototype.hashCode__I = (function() {
  return ScalaJS.systemIdentityHashCode(this)
});
ScalaJS.c.O.prototype["toString"] = (function() {
  return this.toString__T()
});
ScalaJS.is.O = (function(obj) {
  return (obj !== null)
});
ScalaJS.as.O = (function(obj) {
  return obj
});
ScalaJS.isArrayOf.O = (function(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase["isPrimitive"])))
  }
});
ScalaJS.asArrayOf.O = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.O(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Object;", depth))
});
ScalaJS.d.O = new ScalaJS.ClassTypeData({
  O: 0
}, false, "java.lang.Object", null, {
  O: 1
}, ScalaJS.is.O, ScalaJS.isArrayOf.O);
ScalaJS.c.O.prototype.$classData = ScalaJS.d.O;
/** @constructor */
ScalaJS.c.LChromi3wm$ = (function() {
  ScalaJS.c.O.call(this);
  this.ownerKey$1 = null;
  this.trampoli3n$1 = null;
  this.i3$1 = null
});
ScalaJS.c.LChromi3wm$.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$.prototype.constructor = ScalaJS.c.LChromi3wm$;
/** @constructor */
ScalaJS.h.LChromi3wm$ = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$.prototype = ScalaJS.c.LChromi3wm$.prototype;
ScalaJS.c.LChromi3wm$.prototype.init___ = (function() {
  ScalaJS.n.LChromi3wm$ = this;
  this.trampoli3n$1 = "org.i3wm.trampoli3n";
  this.i3$1 = new ScalaJS.c.LChromi3wm$I3().init___();
  return this
});
ScalaJS.c.LChromi3wm$.prototype.keyOf__sjs_js_Dynamic__sjs_js_Dynamic = (function(d) {
  return d["key"]
});
ScalaJS.c.LChromi3wm$.prototype.$$js$exported$prop$i3__O = (function() {
  return this.i3$1
});
ScalaJS.c.LChromi3wm$.prototype.isOwned__LChromi3wm$Container__Z = (function(c) {
  return ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "chromi3wm.owned"))
});
ScalaJS.c.LChromi3wm$.prototype.require__LChromi3wm$Container__T__T__Z__V = (function(c, typed, named, floats) {
  var es = this.errors__LChromi3wm$Container__T__T__Z__sjs_js_Array(c, typed, named, floats);
  if ((ScalaJS.uI(es["length"]) !== 0)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])(ScalaJS.as.T(es["join"](" && ")))))
  }
});
ScalaJS.c.LChromi3wm$.prototype.claimOwned__LChromi3wm$Container__V = (function(c) {
  if ((!this.isOwned__LChromi3wm$Container__Z(c))) {
    if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "chromi3wm.owned"))) {
      new ScalaJS.c.s_Some().init___O(c["chromi3wm.owned"])
    };
    c["chromi3wm.owned"] = true
  } else {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("already owned")))
  }
});
ScalaJS.c.LChromi3wm$.prototype.matches__LChromi3wm$Container__T__T__Z__Z = (function(c, typed, named, floats) {
  return (ScalaJS.uI(this.errors__LChromi3wm$Container__T__T__Z__sjs_js_Array(c, typed, named, floats)["length"]) === 0)
});
ScalaJS.c.LChromi3wm$.prototype.errors__LChromi3wm$Container__T__T__Z__sjs_js_Array = (function(c, typed, named, floats) {
  var result = [];
  if ((c === null)) {
    ScalaJS.uI(result["push"]("need object, have null"))
  } else if ((ScalaJS.as.T((typeof c)) !== "object")) {
    ScalaJS.uI(result["push"](("need object, have " + ScalaJS.as.T((typeof c)))))
  } else {
    if ((!ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "type")))) {
      ScalaJS.uI(result["push"]("type undefined"))
    } else if (((typed !== null) && (typed !== ScalaJS.as.T(c["type"])))) {
      ScalaJS.uI(result["push"](((("need type " + typed) + ", have ") + ScalaJS.as.T(c["type"]))))
    };
    if ((!ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "name")))) {
      ScalaJS.uI(result["push"]("name undefined"))
    } else if (((named !== null) && (named !== ScalaJS.as.T(c["name"])))) {
      ScalaJS.uI(result["push"](((("need name " + named) + ", have ") + ScalaJS.as.T(c["name"]))))
    };
    if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "nodes"))) {
      var nodes = c["nodes"]
    } else {
      var nodes;
      throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + "nodes"))
    };
    if ((!ScalaJS.uZ(ScalaJS.g["Array"]["isArray"](nodes)))) {
      ScalaJS.uI(result["push"](("need nodes array, have " + ScalaJS.as.T((typeof nodes)))))
    };
    if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](c, "floating_nodes"))) {
      var floating = c["floating_nodes"]
    } else {
      var floating;
      throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + "floating_nodes"))
    };
    if ((!ScalaJS.uZ(ScalaJS.g["Array"]["isArray"](floating)))) {
      ScalaJS.uI(result["push"](("need floats array, have " + ScalaJS.as.T((typeof floating)))))
    } else if (((!floats) && (ScalaJS.uI(c["floating_nodes"]["length"]) > 0))) {
      ScalaJS.uI(result["push"]("floating_nodes not allowed"))
    }
  };
  return result
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$.prototype, "i3", {
  "get": (function() {
    return this.$$js$exported$prop$i3__O()
  }),
  "enumerable": true
});
ScalaJS.is.LChromi3wm$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$)))
});
ScalaJS.as.LChromi3wm$ = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$"))
});
ScalaJS.isArrayOf.LChromi3wm$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$)))
});
ScalaJS.asArrayOf.LChromi3wm$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$;", depth))
});
ScalaJS.d.LChromi3wm$ = new ScalaJS.ClassTypeData({
  LChromi3wm$: 0
}, false, "Chromi3wm$", ScalaJS.d.O, {
  LChromi3wm$: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$.prototype.$classData = ScalaJS.d.LChromi3wm$;
ScalaJS.n.LChromi3wm$ = (void 0);
ScalaJS.m.LChromi3wm$ = (function() {
  if ((!ScalaJS.n.LChromi3wm$)) {
    ScalaJS.n.LChromi3wm$ = new ScalaJS.c.LChromi3wm$().init___()
  };
  return ScalaJS.n.LChromi3wm$
});
ScalaJS.e["Chromi3wm"] = ScalaJS.m.LChromi3wm$;
/** @constructor */
ScalaJS.c.LChromi3wm$EdgeDepths = (function() {
  ScalaJS.c.O.call(this);
  this.coord$1 = 0;
  this.above$1 = null;
  this.below$1 = null
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.constructor = ScalaJS.c.LChromi3wm$EdgeDepths;
/** @constructor */
ScalaJS.h.LChromi3wm$EdgeDepths = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$EdgeDepths.prototype = ScalaJS.c.LChromi3wm$EdgeDepths.prototype;
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.$$js$exported$prop$above__O = (function() {
  return this.above$1
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.mark__Z__I__V = (function(hi, depth) {
  (hi ? this.below$1 : this.above$1)[("" + depth)] = depth
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.$$js$exported$prop$coord__O = (function() {
  return this.coord$1
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.init___I = (function(coord) {
  this.coord$1 = coord;
  this.above$1 = ScalaJS.m.sjs_js_Dictionary$().empty__sjs_js_Dictionary();
  this.below$1 = ScalaJS.m.sjs_js_Dictionary$().empty__sjs_js_Dictionary();
  return this
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.$$js$exported$prop$below__O = (function() {
  return this.below$1
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.$$js$exported$meth$mark__Z__I__O = (function(hi, depth) {
  this.mark__Z__I__V(hi, depth)
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeDepths.prototype, "coord", {
  "get": (function() {
    return this.$$js$exported$prop$coord__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeDepths.prototype, "above", {
  "get": (function() {
    return this.$$js$exported$prop$above__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeDepths.prototype, "below", {
  "get": (function() {
    return this.$$js$exported$prop$below__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype["mark"] = (function(arg$1, arg$2) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Boolean"
  } else {
    var preparg$1 = ScalaJS.uZ(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Int"
  } else {
    var preparg$2 = ScalaJS.uI(arg$2)
  };
  return this.$$js$exported$meth$mark__Z__I__O(preparg$1, preparg$2)
});
ScalaJS.is.LChromi3wm$EdgeDepths = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$EdgeDepths)))
});
ScalaJS.as.LChromi3wm$EdgeDepths = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$EdgeDepths(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$EdgeDepths"))
});
ScalaJS.isArrayOf.LChromi3wm$EdgeDepths = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$EdgeDepths)))
});
ScalaJS.asArrayOf.LChromi3wm$EdgeDepths = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$EdgeDepths(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$EdgeDepths;", depth))
});
ScalaJS.d.LChromi3wm$EdgeDepths = new ScalaJS.ClassTypeData({
  LChromi3wm$EdgeDepths: 0
}, false, "Chromi3wm$EdgeDepths", ScalaJS.d.O, {
  LChromi3wm$EdgeDepths: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$EdgeDepths.prototype.$classData = ScalaJS.d.LChromi3wm$EdgeDepths;
/** @constructor */
ScalaJS.c.LChromi3wm$EdgeFunction = (function() {
  ScalaJS.c.O.call(this);
  this.nums$1 = null
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.constructor = ScalaJS.c.LChromi3wm$EdgeFunction;
/** @constructor */
ScalaJS.h.LChromi3wm$EdgeFunction = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$EdgeFunction.prototype = ScalaJS.c.LChromi3wm$EdgeFunction.prototype;
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.$$js$exported$meth$hi__I__I__O = (function(coord, depth) {
  return this.apply__I__Z__I__I(coord, true, depth)
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.$$js$exported$meth$apply__I__Z__I__O = (function(coord, hi, depth) {
  return this.apply__I__Z__I__I(coord, hi, depth)
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.$$js$exported$prop$nums__O = (function() {
  return this.nums$1
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.apply__I__Z__I__I = (function(coord, hi, depth) {
  var array = this.nums$1;
  var len = ScalaJS.uI(array["length"]);
  var i = 0;
  while (true) {
    if ((i < len)) {
      var index = i;
      var arg1 = array[index];
      var x$17 = ScalaJS.as.LChromi3wm$EdgeNumbers(arg1);
      var jsx$1 = (!(x$17.coord$1 >= coord))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  var n = i;
  var i$1 = ((n >= ScalaJS.uI(array["length"])) ? (-1) : n);
  if (((i$1 < 0) || ((i$1 === 0) && (ScalaJS.as.LChromi3wm$EdgeNumbers(this.nums$1[0]).coord$1 !== coord)))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("out of range")))
  };
  var e = ScalaJS.as.LChromi3wm$EdgeNumbers(this.nums$1[i$1]);
  if ((ScalaJS.uI(this.nums$1["length"]) === 1)) {
    return 0
  } else if ((coord !== e.coord$1)) {
    var $$this = e.prev$1;
    if (($$this === (void 0))) {
      var jsx$2;
      throw new ScalaJS.c.ju_NoSuchElementException().init___T("undefined.get")
    } else {
      var jsx$2 = $$this
    };
    return ScalaJS.as.LChromi3wm$EdgeNumbers(jsx$2).limit$1
  } else if ((depth < 0)) {
    return e.origin$1
  } else {
    var array$1 = (hi ? e.below$1 : e.above$1);
    var len$1 = ScalaJS.uI(array$1["length"]);
    var i$2 = 0;
    while (true) {
      if ((i$2 < len$1)) {
        var index$1 = i$2;
        var arg1$1 = array$1[index$1];
        var jsx$3 = (!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(depth, arg1$1))
      } else {
        var jsx$3 = false
      };
      if (jsx$3) {
        i$2 = ((1 + i$2) | 0)
      } else {
        break
      }
    };
    var n$1 = i$2;
    var d = ((n$1 >= ScalaJS.uI(array$1["length"])) ? (-1) : n$1);
    if ((d < 0)) {
      throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("out of range")))
    };
    return (hi ? (((-1) + ((e.origin$1 - d) | 0)) | 0) : ((1 + ((e.origin$1 + d) | 0)) | 0))
  }
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.init___sjs_js_Array = (function(nums) {
  this.nums$1 = nums;
  if ((ScalaJS.uI(nums["length"]) === 0)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("no nums")))
  };
  return this
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.$$js$exported$meth$lo__I__I__O = (function(coord, depth) {
  return this.apply__I__Z__I__I(coord, false, depth)
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeFunction.prototype, "nums", {
  "get": (function() {
    return this.$$js$exported$prop$nums__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype["apply"] = (function(arg$1, arg$2, arg$3) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Int"
  } else {
    var preparg$1 = ScalaJS.uI(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Boolean"
  } else {
    var preparg$2 = ScalaJS.uZ(arg$2)
  };
  if ((arg$3 === null)) {
    var preparg$3;
    throw "Found null, expected Int"
  } else {
    var preparg$3 = ScalaJS.uI(arg$3)
  };
  return this.$$js$exported$meth$apply__I__Z__I__O(preparg$1, preparg$2, preparg$3)
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype["lo"] = (function(arg$1, arg$2) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Int"
  } else {
    var preparg$1 = ScalaJS.uI(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Int"
  } else {
    var preparg$2 = ScalaJS.uI(arg$2)
  };
  return this.$$js$exported$meth$lo__I__I__O(preparg$1, preparg$2)
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype["hi"] = (function(arg$1, arg$2) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Int"
  } else {
    var preparg$1 = ScalaJS.uI(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Int"
  } else {
    var preparg$2 = ScalaJS.uI(arg$2)
  };
  return this.$$js$exported$meth$hi__I__I__O(preparg$1, preparg$2)
});
ScalaJS.is.LChromi3wm$EdgeFunction = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$EdgeFunction)))
});
ScalaJS.as.LChromi3wm$EdgeFunction = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$EdgeFunction(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$EdgeFunction"))
});
ScalaJS.isArrayOf.LChromi3wm$EdgeFunction = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$EdgeFunction)))
});
ScalaJS.asArrayOf.LChromi3wm$EdgeFunction = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$EdgeFunction(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$EdgeFunction;", depth))
});
ScalaJS.d.LChromi3wm$EdgeFunction = new ScalaJS.ClassTypeData({
  LChromi3wm$EdgeFunction: 0
}, false, "Chromi3wm$EdgeFunction", ScalaJS.d.O, {
  LChromi3wm$EdgeFunction: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$EdgeFunction.prototype.$classData = ScalaJS.d.LChromi3wm$EdgeFunction;
/** @constructor */
ScalaJS.c.LChromi3wm$EdgeMarker = (function() {
  ScalaJS.c.O.call(this);
  this.data$1 = null
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.constructor = ScalaJS.c.LChromi3wm$EdgeMarker;
/** @constructor */
ScalaJS.h.LChromi3wm$EdgeMarker = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$EdgeMarker.prototype = ScalaJS.c.LChromi3wm$EdgeMarker.prototype;
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.init___ = (function() {
  this.data$1 = ScalaJS.m.sjs_js_Dictionary$().empty__sjs_js_Dictionary();
  return this
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.$$js$exported$prop$data__O = (function() {
  return this.data$1
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.mark__I__Z__I__V = (function(coord, hi, depth) {
  var key = ("" + coord);
  var dict = this.data$1;
  var x1 = (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, key)) ? new ScalaJS.c.s_Some().init___O(dict[key]) : ScalaJS.m.s_None$());
  if (ScalaJS.is.s_Some(x1)) {
    var x2 = ScalaJS.as.s_Some(x1);
    var v = x2.x$2;
    var jsx$1 = v
  } else {
    var x = ScalaJS.m.s_None$();
    if ((x === x1)) {
      var edge = new ScalaJS.c.LChromi3wm$EdgeDepths().init___I(coord);
      this.data$1[key] = edge;
      dict[key] = edge;
      var jsx$1 = edge
    } else {
      var jsx$1;
      throw new ScalaJS.c.s_MatchError().init___O(x1)
    }
  };
  ScalaJS.as.LChromi3wm$EdgeDepths(jsx$1).mark__Z__I__V(hi, depth)
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.$$js$exported$meth$mark__I__Z__I__O = (function(coord, hi, depth) {
  this.mark__I__Z__I__V(coord, hi, depth)
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.$$js$exported$prop$compute__O = (function() {
  return this.compute__sjs_js_Array()
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.compute__sjs_js_Array = (function() {
  var dict = this.data$1;
  var this$2 = new ScalaJS.c.sjs_js_WrappedDictionary().init___sjs_js_Dictionary(dict);
  var this$4 = new ScalaJS.c.sc_MapLike$DefaultValuesIterable().init___sc_MapLike(this$2);
  var array = [];
  matchEnd4: {
    var this$5 = this$4.$$outer$f;
    var this$6 = new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$5);
    while (this$6.iter$2.hasNext__Z()) {
      var arg1 = this$6.next__O();
      array["push"](arg1)
    };
    break matchEnd4
  };
  var array$1 = array["sort"]((function(one$2, two$2) {
    var one = ScalaJS.as.LChromi3wm$EdgeDepths(one$2);
    var two = ScalaJS.as.LChromi3wm$EdgeDepths(two$2);
    return ((one.coord$1 - two.coord$1) | 0)
  }));
  var array$2 = [];
  ScalaJS.uI(array$1["length"]);
  var elem$1 = null;
  elem$1 = (void 0);
  var elem = elem$1;
  array$2["push"](elem);
  var i = 0;
  var len = ScalaJS.uI(array$1["length"]);
  while ((i < len)) {
    var index = i;
    var arg1$1 = array$1[index];
    var arg1$2 = elem$1;
    var x$16 = ScalaJS.as.LChromi3wm$EdgeDepths(arg1$1);
    var value = new ScalaJS.c.LChromi3wm$EdgeNumbers().init___sjs_js_UndefOr__LChromi3wm$EdgeDepths(arg1$2, x$16);
    elem$1 = value;
    var elem$2 = elem$1;
    array$2["push"](elem$2);
    i = ((1 + i) | 0)
  };
  return array$2["slice"](1)
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeMarker.prototype, "data", {
  "get": (function() {
    return this.$$js$exported$prop$data__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype["mark"] = (function(arg$1, arg$2, arg$3) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Int"
  } else {
    var preparg$1 = ScalaJS.uI(arg$1)
  };
  if ((arg$2 === null)) {
    var preparg$2;
    throw "Found null, expected Boolean"
  } else {
    var preparg$2 = ScalaJS.uZ(arg$2)
  };
  if ((arg$3 === null)) {
    var preparg$3;
    throw "Found null, expected Int"
  } else {
    var preparg$3 = ScalaJS.uI(arg$3)
  };
  return this.$$js$exported$meth$mark__I__Z__I__O(preparg$1, preparg$2, preparg$3)
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeMarker.prototype, "compute", {
  "get": (function() {
    return this.$$js$exported$prop$compute__O()
  }),
  "enumerable": true
});
ScalaJS.is.LChromi3wm$EdgeMarker = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$EdgeMarker)))
});
ScalaJS.as.LChromi3wm$EdgeMarker = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$EdgeMarker(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$EdgeMarker"))
});
ScalaJS.isArrayOf.LChromi3wm$EdgeMarker = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$EdgeMarker)))
});
ScalaJS.asArrayOf.LChromi3wm$EdgeMarker = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$EdgeMarker(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$EdgeMarker;", depth))
});
ScalaJS.d.LChromi3wm$EdgeMarker = new ScalaJS.ClassTypeData({
  LChromi3wm$EdgeMarker: 0
}, false, "Chromi3wm$EdgeMarker", ScalaJS.d.O, {
  LChromi3wm$EdgeMarker: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$EdgeMarker.prototype.$classData = ScalaJS.d.LChromi3wm$EdgeMarker;
/** @constructor */
ScalaJS.c.LChromi3wm$EdgeNumbers = (function() {
  ScalaJS.c.O.call(this);
  this.prev$1 = null;
  this.coord$1 = 0;
  this.above$1 = null;
  this.below$1 = null;
  this.first$1 = 0;
  this.origin$1 = 0;
  this.limit$1 = 0
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.constructor = ScalaJS.c.LChromi3wm$EdgeNumbers;
/** @constructor */
ScalaJS.h.LChromi3wm$EdgeNumbers = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$EdgeNumbers.prototype = ScalaJS.c.LChromi3wm$EdgeNumbers.prototype;
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$limit__O = (function() {
  return this.limit$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$first__O = (function() {
  return this.first$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$above__O = (function() {
  return this.above$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$coord__O = (function() {
  return this.coord$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.init___sjs_js_UndefOr__LChromi3wm$EdgeDepths = (function(prev, depths) {
  this.prev$1 = prev;
  this.coord$1 = depths.coord$1;
  var dict = depths.above$1;
  var this$2 = new ScalaJS.c.sjs_js_WrappedDictionary().init___sjs_js_Dictionary(dict);
  var this$4 = new ScalaJS.c.sc_MapLike$DefaultValuesIterable().init___sc_MapLike(this$2);
  var array = [];
  matchEnd4: {
    var this$5 = this$4.$$outer$f;
    var this$6 = new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$5);
    while (this$6.iter$2.hasNext__Z()) {
      var arg1 = this$6.next__O();
      array["push"](arg1)
    };
    break matchEnd4
  };
  this.above$1 = array["sort"]();
  var dict$1 = depths.below$1;
  var this$8 = new ScalaJS.c.sjs_js_WrappedDictionary().init___sjs_js_Dictionary(dict$1);
  var this$10 = new ScalaJS.c.sc_MapLike$DefaultValuesIterable().init___sc_MapLike(this$8);
  var array$1 = [];
  matchEnd4$1: {
    var this$11 = this$10.$$outer$f;
    var this$12 = new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$11);
    while (this$12.iter$2.hasNext__Z()) {
      var arg1$1 = this$12.next__O();
      array$1["push"](arg1$1)
    };
    break matchEnd4$1
  };
  this.below$1 = array$1["sort"]();
  if ((prev === (void 0))) {
    var $$this = (void 0)
  } else {
    var x$14 = ScalaJS.as.LChromi3wm$EdgeNumbers(prev);
    var $$this = x$14.limit$1
  };
  this.first$1 = ScalaJS.uI((($$this === (void 0)) ? 0 : $$this));
  this.origin$1 = ((this.first$1 + ScalaJS.uI(this.below$1["length"])) | 0);
  this.limit$1 = ((((1 + this.origin$1) | 0) + ScalaJS.uI(this.above$1["length"])) | 0);
  return this
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$below__O = (function() {
  return this.below$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$origin__O = (function() {
  return this.origin$1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$$js$exported$prop$prev__O = (function() {
  return this.prev$1
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "prev", {
  "get": (function() {
    return this.$$js$exported$prop$prev__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "coord", {
  "get": (function() {
    return this.$$js$exported$prop$coord__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "above", {
  "get": (function() {
    return this.$$js$exported$prop$above__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "below", {
  "get": (function() {
    return this.$$js$exported$prop$below__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "first", {
  "get": (function() {
    return this.$$js$exported$prop$first__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "origin", {
  "get": (function() {
    return this.$$js$exported$prop$origin__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$EdgeNumbers.prototype, "limit", {
  "get": (function() {
    return this.$$js$exported$prop$limit__O()
  }),
  "enumerable": true
});
ScalaJS.is.LChromi3wm$EdgeNumbers = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$EdgeNumbers)))
});
ScalaJS.as.LChromi3wm$EdgeNumbers = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$EdgeNumbers(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$EdgeNumbers"))
});
ScalaJS.isArrayOf.LChromi3wm$EdgeNumbers = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$EdgeNumbers)))
});
ScalaJS.asArrayOf.LChromi3wm$EdgeNumbers = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$EdgeNumbers(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$EdgeNumbers;", depth))
});
ScalaJS.d.LChromi3wm$EdgeNumbers = new ScalaJS.ClassTypeData({
  LChromi3wm$EdgeNumbers: 0
}, false, "Chromi3wm$EdgeNumbers", ScalaJS.d.O, {
  LChromi3wm$EdgeNumbers: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$EdgeNumbers.prototype.$classData = ScalaJS.d.LChromi3wm$EdgeNumbers;
/** @constructor */
ScalaJS.c.LChromi3wm$I3 = (function() {
  ScalaJS.c.O.call(this);
  this.port$1 = null;
  this.menu$1 = null;
  this.time$1 = null;
  this.hidden$1 = null;
  this.result$1 = null;
  this.data$1 = null;
  this.root$1 = null;
  this.diff$1 = false;
  this.last$1 = null;
  this.boxy$1 = null
});
ScalaJS.c.LChromi3wm$I3.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$I3.prototype.constructor = ScalaJS.c.LChromi3wm$I3;
/** @constructor */
ScalaJS.h.LChromi3wm$I3 = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$I3.prototype = ScalaJS.c.LChromi3wm$I3.prototype;
ScalaJS.c.LChromi3wm$I3.prototype.tree__V = (function() {
  this.ask__I__sjs_js_Any__V(4, "")
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$root__sjs_js_UndefOr__O = (function(x$1) {
  this.root$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.init___ = (function() {
  this.port$1 = (void 0);
  this.menu$1 = ScalaJS.g["d3"]["select"]("#menu");
  this.time$1 = ScalaJS.g["d3"]["select"]("#time");
  ScalaJS.g["d3"]["selectAll"]([this.menu$1["node"](), this.time$1["node"]()])["on"]("click", (function(arg$outer) {
    return (function() {
      arg$outer.tree__V()
    })
  })(this));
  this.hidden$1 = ScalaJS.g["d3"]["select"]("#hidden");
  this.result$1 = ScalaJS.g["d3"]["select"]("#result");
  this.data$1 = (void 0);
  this.root$1 = (void 0);
  this.diff$1 = false;
  this.last$1 = "none";
  this.boxy$1 = (void 0);
  this.tree__V();
  return this
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$result__O = (function() {
  return this.result$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$hidden__O = (function() {
  return this.hidden$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$outputs__O = (function() {
  this.outputs__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$data__O = (function() {
  return this.data$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$boxy__O = (function() {
  return this.boxy$1
});
ScalaJS.c.LChromi3wm$I3.prototype.workspaces__V = (function() {
  this.ask__I__sjs_js_Any__V(1, "")
});
ScalaJS.c.LChromi3wm$I3.prototype.command__T__V = (function(cmd) {
  this.ask__I__sjs_js_Any__V(0, cmd)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$diff__O = (function() {
  return this.diff$1
});
ScalaJS.c.LChromi3wm$I3.prototype.marks__V = (function() {
  this.ask__I__sjs_js_Any__V(5, "")
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$data__sjs_js_UndefOr__O = (function(x$1) {
  this.data$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$menu__O = (function() {
  return this.menu$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$tree__O = (function() {
  this.tree__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$version__O = (function() {
  this.version__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.open__V = (function() {
  this.close__V();
  var jsx$2 = ScalaJS.g["chrome"]["runtime"];
  var s = ScalaJS.m.LChromi3wm$().trampoli3n$1;
  var jsx$1 = jsx$2["connectNative"](s);
  this.port$1 = jsx$1;
  var $$this = this.port$1;
  if (($$this === (void 0))) {
    var jsx$4;
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("undefined.get")
  } else {
    var jsx$4 = $$this
  };
  var jsx$3 = jsx$4["onDisconnect"];
  jsx$3["addListener"]((function(arg$outer) {
    return (function() {
      arg$outer.port$1 = (void 0)
    })
  })(this));
  var $$this$1 = this.port$1;
  if (($$this$1 === (void 0))) {
    var jsx$6;
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("undefined.get")
  } else {
    var jsx$6 = $$this$1
  };
  var jsx$5 = jsx$6["onMessage"];
  jsx$5["addListener"]((function(arg$outer$1) {
    return (function(message$2) {
      arg$outer$1.listener__sjs_js_Any__V(message$2)
    })
  })(this))
});
ScalaJS.c.LChromi3wm$I3.prototype.bar$undconfig__T__V = (function(id) {
  this.ask__I__sjs_js_Any__V(6, id)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$root__O = (function() {
  return this.root$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$ask__I__sjs_js_Any__O = (function(what, payload) {
  this.ask__I__sjs_js_Any__V(what, payload)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$workspaces__O = (function() {
  this.workspaces__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$command__T__O = (function(cmd) {
  this.command__T__V(cmd)
});
ScalaJS.c.LChromi3wm$I3.prototype.bars__V = (function() {
  this.ask__I__sjs_js_Any__V(6, "")
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$port__sjs_js_UndefOr__O = (function(x$1) {
  this.port$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$diff__Z__O = (function(x$1) {
  this.diff$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.outputs__V = (function() {
  this.ask__I__sjs_js_Any__V(3, "")
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$last__O = (function() {
  return this.last$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$listener__sjs_js_Any__O = (function(message) {
  this.listener__sjs_js_Any__V(message)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$open__O = (function() {
  this.open__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$close__O = (function() {
  this.close__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$boxy__sjs_js_UndefOr__O = (function(x$1) {
  this.boxy$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$port__O = (function() {
  return this.port$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$last__T__O = (function(x$1) {
  this.last$1 = x$1
});
ScalaJS.c.LChromi3wm$I3.prototype.listener__sjs_js_Any__V = (function(message) {
  this.data$1 = message;
  this.root$1 = null;
  var now = ScalaJS.as.T(new ScalaJS.g["Date"]()["toJSON"]());
  ScalaJS.g["console"]["log"]("I3.listener", now);
  this.time$1["text"](now);
  var x1 = ScalaJS.objectToString(this.menu$1["node"]()["value"]);
  if ((x1 === "area")) {
    if ((!ScalaJS.uZ(ScalaJS.g["Array"]["isArray"](message)))) {
      ScalaJS.g["console"]["error"]("message is not an array", message)
    } else if (((ScalaJS.uI(message["length"]) !== 2) || (!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(message[0], 4)))) {
      ScalaJS.g["console"]["error"]("unexpected message format", message)
    } else {
      if ((this.last$1 !== "area")) {
        this.diff$1 = false;
        this.result$1["html"]("<ul>");
        this.hidden$1["style"]("display", "none");
        this.last$1 = "area"
      };
      this.root$1 = new ScalaJS.c.LChromi3wm$Root().init___LChromi3wm$Container(message[1]);
      var $$this = this.root$1;
      if (($$this === (void 0))) {
        var jsx$1;
        throw new ScalaJS.c.ju_NoSuchElementException().init___T("undefined.get")
      } else {
        var jsx$1 = $$this
      };
      ScalaJS.as.LChromi3wm$Root(jsx$1).render__sjs_js_Dynamic__V(this.result$1["selectKids"]("ul"))
    }
  } else if ((x1 === "boxy")) {
    if ((this.last$1 !== "boxy")) {
      this.result$1["html"]("<div>");
      this.hidden$1["style"]("display", null);
      this.last$1 = "boxy"
    };
    var jsx$3 = this.result$1["selectKids"]("div");
    var value$2 = this.data$1;
    var jsx$2 = jsx$3["datum"](((value$2 === (void 0)) ? (void 0) : value$2));
    var value$3 = this.boxy$1;
    jsx$2["each"](((value$3 === (void 0)) ? (void 0) : value$3));
    this.diff$1 = true
  } else {
    ScalaJS.g["console"]["log"]("impossible menu option", x1)
  }
});
ScalaJS.c.LChromi3wm$I3.prototype.close__V = (function() {
  var $$this = this.port$1;
  if (($$this !== (void 0))) {
    $$this["disconnect"]()
  };
  this.port$1 = (void 0)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$prop$time__O = (function() {
  return this.time$1
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$bar$undconfig__T__O = (function(id) {
  this.bar$undconfig__T__V(id)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$bars__O = (function() {
  this.bars__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.subscribe__sc_Seq__V = (function(to) {
  var b = new ScalaJS.c.sjs_js_ArrayOps().init___();
  ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, to);
  var xs = to.thisCollection__sc_Traversable();
  ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(b, xs);
  this.ask__I__sjs_js_Any__V(2, b.scala$scalajs$js$ArrayOps$$array$f)
});
ScalaJS.c.LChromi3wm$I3.prototype.ask__I__sjs_js_Any__V = (function(what, payload) {
  var $$this = this.port$1;
  if (($$this === (void 0))) {
    this.open__V()
  };
  var $$this$1 = this.port$1;
  if (($$this$1 === (void 0))) {
    var jsx$1;
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("undefined.get")
  } else {
    var jsx$1 = $$this$1
  };
  jsx$1["postMessage"]([what, payload])
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$subscribe__sc_Seq__O = (function(to) {
  this.subscribe__sc_Seq__V(to)
});
ScalaJS.c.LChromi3wm$I3.prototype.$$js$exported$meth$marks__O = (function() {
  this.marks__V()
});
ScalaJS.c.LChromi3wm$I3.prototype.version__V = (function() {
  this.ask__I__sjs_js_Any__V(7, "")
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "port", {
  "set": (function(arg$1) {
    var preparg$1 = arg$1;
    this.$$js$exported$prop$port__sjs_js_UndefOr__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$port__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$I3.prototype["close"] = (function() {
  return this.$$js$exported$meth$close__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["open"] = (function() {
  return this.$$js$exported$meth$open__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "menu", {
  "get": (function() {
    return this.$$js$exported$prop$menu__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "time", {
  "get": (function() {
    return this.$$js$exported$prop$time__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "hidden", {
  "get": (function() {
    return this.$$js$exported$prop$hidden__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "result", {
  "get": (function() {
    return this.$$js$exported$prop$result__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "data", {
  "set": (function(arg$1) {
    var preparg$1 = arg$1;
    this.$$js$exported$prop$data__sjs_js_UndefOr__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$data__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "root", {
  "set": (function(arg$1) {
    var preparg$1 = arg$1;
    this.$$js$exported$prop$root__sjs_js_UndefOr__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$root__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "diff", {
  "set": (function(arg$1) {
    if ((arg$1 === null)) {
      var preparg$1;
      throw "Found null, expected Boolean"
    } else {
      var preparg$1 = ScalaJS.uZ(arg$1)
    };
    this.$$js$exported$prop$diff__Z__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$diff__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "last", {
  "set": (function(arg$1) {
    var preparg$1 = ScalaJS.as.T(arg$1);
    this.$$js$exported$prop$last__T__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$last__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$I3.prototype, "boxy", {
  "set": (function(arg$1) {
    var preparg$1 = arg$1;
    this.$$js$exported$prop$boxy__sjs_js_UndefOr__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$boxy__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$I3.prototype["listener"] = (function(arg$1) {
  var preparg$1 = arg$1;
  return this.$$js$exported$meth$listener__sjs_js_Any__O(preparg$1)
});
ScalaJS.c.LChromi3wm$I3.prototype["command"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.T(arg$1);
  return this.$$js$exported$meth$command__T__O(preparg$1)
});
ScalaJS.c.LChromi3wm$I3.prototype["subscribe"] = (function() {
  var i = 0;
  var count = ((ScalaJS.uI(arguments["length"]) - 0) | 0);
  var varargs = new ScalaJS.g["Array"](count);
  while ((i < count)) {
    varargs[i] = arguments[((0 + i) | 0)];
    i = ((i + 1) | 0)
  };
  return this.$$js$exported$meth$subscribe__sc_Seq__O(new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(varargs))
});
ScalaJS.c.LChromi3wm$I3.prototype["bar_config"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.T(arg$1);
  return this.$$js$exported$meth$bar$undconfig__T__O(preparg$1)
});
ScalaJS.c.LChromi3wm$I3.prototype["workspaces"] = (function() {
  return this.$$js$exported$meth$workspaces__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["outputs"] = (function() {
  return this.$$js$exported$meth$outputs__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["tree"] = (function() {
  return this.$$js$exported$meth$tree__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["marks"] = (function() {
  return this.$$js$exported$meth$marks__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["bars"] = (function() {
  return this.$$js$exported$meth$bars__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["version"] = (function() {
  return this.$$js$exported$meth$version__O()
});
ScalaJS.c.LChromi3wm$I3.prototype["ask"] = (function(arg$1, arg$2) {
  if ((arg$1 === null)) {
    var preparg$1;
    throw "Found null, expected Int"
  } else {
    var preparg$1 = ScalaJS.uI(arg$1)
  };
  var preparg$2 = arg$2;
  return this.$$js$exported$meth$ask__I__sjs_js_Any__O(preparg$1, preparg$2)
});
ScalaJS.is.LChromi3wm$I3 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$I3)))
});
ScalaJS.as.LChromi3wm$I3 = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$I3(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$I3"))
});
ScalaJS.isArrayOf.LChromi3wm$I3 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$I3)))
});
ScalaJS.asArrayOf.LChromi3wm$I3 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$I3(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$I3;", depth))
});
ScalaJS.d.LChromi3wm$I3 = new ScalaJS.ClassTypeData({
  LChromi3wm$I3: 0
}, false, "Chromi3wm$I3", ScalaJS.d.O, {
  LChromi3wm$I3: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$I3.prototype.$classData = ScalaJS.d.LChromi3wm$I3;
/** @constructor */
ScalaJS.c.LChromi3wm$WrappedContainer = (function() {
  ScalaJS.c.O.call(this);
  this.c$1 = null;
  this.depth$1 = 0;
  this.parent$1 = null
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype = new ScalaJS.h.O();
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.constructor = ScalaJS.c.LChromi3wm$WrappedContainer;
/** @constructor */
ScalaJS.h.LChromi3wm$WrappedContainer = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$WrappedContainer.prototype = ScalaJS.c.LChromi3wm$WrappedContainer.prototype;
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.y2__I = (function() {
  return ((this.y1__I() + this.dy__I()) | 0)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.dx__I = (function() {
  return ScalaJS.uI(this.c$1["rect"]["width"])
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$x2__O = (function() {
  return this.x2__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.yIn__LChromi3wm$EdgeFunction__I = (function(yf) {
  var jsx$1 = this.y1__I();
  var coord = this.y1__I();
  var depth = this.depth$1;
  return ((jsx$1 + ScalaJS.imul(40, yf.apply__I__Z__I__I(coord, false, depth))) | 0)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$dx__O = (function() {
  return this.dx__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$y2__O = (function() {
  return this.y2__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.hIn__LChromi3wm$EdgeFunction__I = (function(yf) {
  var jsx$1 = this.y2__I();
  var coord = this.y2__I();
  var depth = this.depth$1;
  return ((((jsx$1 + ScalaJS.imul(40, yf.apply__I__Z__I__I(coord, true, depth))) | 0) - this.yIn__LChromi3wm$EdgeFunction__I(yf)) | 0)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.x1__I = (function() {
  return ScalaJS.uI(this.c$1["rect"]["x"])
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$meth$xIn__LChromi3wm$EdgeFunction__O = (function(xf) {
  return this.xIn__LChromi3wm$EdgeFunction__I(xf)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$x1__O = (function() {
  return this.x1__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$meth$wIn__LChromi3wm$EdgeFunction__O = (function(xf) {
  return this.wIn__LChromi3wm$EdgeFunction__I(xf)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.dy__I = (function() {
  return ScalaJS.uI(this.c$1["rect"]["height"])
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.y1__I = (function() {
  return ScalaJS.uI(this.c$1["rect"]["y"])
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$depth__I__O = (function(x$1) {
  this.depth$1 = x$1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$parent__O = (function() {
  return this.parent$1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$meth$yIn__LChromi3wm$EdgeFunction__O = (function(yf) {
  return this.yIn__LChromi3wm$EdgeFunction__I(yf)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$meth$mark__LChromi3wm$EdgeMarker__LChromi3wm$EdgeMarker__O = (function(xm, ym) {
  this.mark__LChromi3wm$EdgeMarker__LChromi3wm$EdgeMarker__V(xm, ym)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$dy__O = (function() {
  return this.dy__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$c__O = (function() {
  return this.c$1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$parent__sjs_js_Any__O = (function(x$1) {
  this.parent$1 = x$1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container = (function(c) {
  this.c$1 = c;
  this.depth$1 = 0;
  this.parent$1 = null;
  return this
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.mark__LChromi3wm$EdgeMarker__LChromi3wm$EdgeMarker__V = (function(xm, ym) {
  xm.mark__I__Z__I__V(this.x1__I(), false, this.depth$1);
  xm.mark__I__Z__I__V(this.x2__I(), true, this.depth$1);
  ym.mark__I__Z__I__V(this.y1__I(), false, this.depth$1);
  ym.mark__I__Z__I__V(this.y2__I(), true, this.depth$1)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$meth$hIn__LChromi3wm$EdgeFunction__O = (function(yf) {
  return this.hIn__LChromi3wm$EdgeFunction__I(yf)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$y1__O = (function() {
  return this.y1__I()
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.wIn__LChromi3wm$EdgeFunction__I = (function(xf) {
  var jsx$1 = this.x2__I();
  var coord = this.x2__I();
  var depth = this.depth$1;
  return ((((jsx$1 + ScalaJS.imul(40, xf.apply__I__Z__I__I(coord, true, depth))) | 0) - this.xIn__LChromi3wm$EdgeFunction__I(xf)) | 0)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$$js$exported$prop$depth__O = (function() {
  return this.depth$1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.x2__I = (function() {
  return ((this.x1__I() + this.dx__I()) | 0)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.xIn__LChromi3wm$EdgeFunction__I = (function(xf) {
  var jsx$1 = this.x1__I();
  var coord = this.x1__I();
  var depth = this.depth$1;
  return ((jsx$1 + ScalaJS.imul(40, xf.apply__I__Z__I__I(coord, false, depth))) | 0)
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "c", {
  "get": (function() {
    return this.$$js$exported$prop$c__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "depth", {
  "set": (function(arg$1) {
    if ((arg$1 === null)) {
      var preparg$1;
      throw "Found null, expected Int"
    } else {
      var preparg$1 = ScalaJS.uI(arg$1)
    };
    this.$$js$exported$prop$depth__I__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$depth__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "parent", {
  "set": (function(arg$1) {
    var preparg$1 = arg$1;
    this.$$js$exported$prop$parent__sjs_js_Any__O(preparg$1)
  }),
  "get": (function() {
    return this.$$js$exported$prop$parent__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "x1", {
  "get": (function() {
    return this.$$js$exported$prop$x1__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "dx", {
  "get": (function() {
    return this.$$js$exported$prop$dx__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "x2", {
  "get": (function() {
    return this.$$js$exported$prop$x2__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "y1", {
  "get": (function() {
    return this.$$js$exported$prop$y1__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "dy", {
  "get": (function() {
    return this.$$js$exported$prop$dy__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$WrappedContainer.prototype, "y2", {
  "get": (function() {
    return this.$$js$exported$prop$y2__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype["mark"] = (function(arg$1, arg$2) {
  var preparg$1 = ScalaJS.as.LChromi3wm$EdgeMarker(arg$1);
  var preparg$2 = ScalaJS.as.LChromi3wm$EdgeMarker(arg$2);
  return this.$$js$exported$meth$mark__LChromi3wm$EdgeMarker__LChromi3wm$EdgeMarker__O(preparg$1, preparg$2)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype["xIn"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.LChromi3wm$EdgeFunction(arg$1);
  return this.$$js$exported$meth$xIn__LChromi3wm$EdgeFunction__O(preparg$1)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype["yIn"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.LChromi3wm$EdgeFunction(arg$1);
  return this.$$js$exported$meth$yIn__LChromi3wm$EdgeFunction__O(preparg$1)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype["wIn"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.LChromi3wm$EdgeFunction(arg$1);
  return this.$$js$exported$meth$wIn__LChromi3wm$EdgeFunction__O(preparg$1)
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype["hIn"] = (function(arg$1) {
  var preparg$1 = ScalaJS.as.LChromi3wm$EdgeFunction(arg$1);
  return this.$$js$exported$meth$hIn__LChromi3wm$EdgeFunction__O(preparg$1)
});
ScalaJS.is.LChromi3wm$WrappedContainer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$WrappedContainer)))
});
ScalaJS.as.LChromi3wm$WrappedContainer = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$WrappedContainer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$WrappedContainer"))
});
ScalaJS.isArrayOf.LChromi3wm$WrappedContainer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$WrappedContainer)))
});
ScalaJS.asArrayOf.LChromi3wm$WrappedContainer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$WrappedContainer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$WrappedContainer;", depth))
});
ScalaJS.d.LChromi3wm$WrappedContainer = new ScalaJS.ClassTypeData({
  LChromi3wm$WrappedContainer: 0
}, false, "Chromi3wm$WrappedContainer", ScalaJS.d.O, {
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$WrappedContainer.prototype.$classData = ScalaJS.d.LChromi3wm$WrappedContainer;
/** @constructor */
ScalaJS.c.jl_Class = (function() {
  ScalaJS.c.O.call(this);
  this.data$1 = null
});
ScalaJS.c.jl_Class.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Class.prototype.constructor = ScalaJS.c.jl_Class;
/** @constructor */
ScalaJS.h.jl_Class = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Class.prototype = ScalaJS.c.jl_Class.prototype;
ScalaJS.c.jl_Class.prototype.getName__T = (function() {
  return ScalaJS.as.T(this.data$1["name"])
});
ScalaJS.c.jl_Class.prototype.isPrimitive__Z = (function() {
  return ScalaJS.uZ(this.data$1["isPrimitive"])
});
ScalaJS.c.jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
ScalaJS.c.jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
ScalaJS.c.jl_Class.prototype.isInterface__Z = (function() {
  return ScalaJS.uZ(this.data$1["isInterface"])
});
ScalaJS.is.jl_Class = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Class)))
});
ScalaJS.as.jl_Class = (function(obj) {
  return ((ScalaJS.is.jl_Class(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Class"))
});
ScalaJS.isArrayOf.jl_Class = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Class)))
});
ScalaJS.asArrayOf.jl_Class = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Class(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Class;", depth))
});
ScalaJS.d.jl_Class = new ScalaJS.ClassTypeData({
  jl_Class: 0
}, false, "java.lang.Class", ScalaJS.d.O, {
  jl_Class: 1,
  O: 1
});
ScalaJS.c.jl_Class.prototype.$classData = ScalaJS.d.jl_Class;
/** @constructor */
ScalaJS.c.jl_Double$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.jl_Double$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Double$.prototype.constructor = ScalaJS.c.jl_Double$;
/** @constructor */
ScalaJS.h.jl_Double$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Double$.prototype = ScalaJS.c.jl_Double$.prototype;
ScalaJS.c.jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
ScalaJS.is.jl_Double$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Double$)))
});
ScalaJS.as.jl_Double$ = (function(obj) {
  return ((ScalaJS.is.jl_Double$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Double$"))
});
ScalaJS.isArrayOf.jl_Double$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double$)))
});
ScalaJS.asArrayOf.jl_Double$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Double$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Double$;", depth))
});
ScalaJS.d.jl_Double$ = new ScalaJS.ClassTypeData({
  jl_Double$: 0
}, false, "java.lang.Double$", ScalaJS.d.O, {
  jl_Double$: 1,
  O: 1
});
ScalaJS.c.jl_Double$.prototype.$classData = ScalaJS.d.jl_Double$;
ScalaJS.n.jl_Double$ = (void 0);
ScalaJS.m.jl_Double$ = (function() {
  if ((!ScalaJS.n.jl_Double$)) {
    ScalaJS.n.jl_Double$ = new ScalaJS.c.jl_Double$().init___()
  };
  return ScalaJS.n.jl_Double$
});
/** @constructor */
ScalaJS.c.jl_Integer$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0
});
ScalaJS.c.jl_Integer$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Integer$.prototype.constructor = ScalaJS.c.jl_Integer$;
/** @constructor */
ScalaJS.h.jl_Integer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Integer$.prototype = ScalaJS.c.jl_Integer$.prototype;
ScalaJS.c.jl_Integer$.prototype.rotateLeft__I__I__I = (function(i, distance) {
  return ((i << distance) | ((i >>> ((-distance) | 0)) | 0))
});
ScalaJS.c.jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return (ScalaJS.imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
ScalaJS.c.jl_Integer$.prototype.numberOfLeadingZeros__I__I = (function(i) {
  var x = i;
  x = (x | ((x >>> 1) | 0));
  x = (x | ((x >>> 2) | 0));
  x = (x | ((x >>> 4) | 0));
  x = (x | ((x >>> 8) | 0));
  x = (x | ((x >>> 16) | 0));
  return ((32 - this.bitCount__I__I(x)) | 0)
});
ScalaJS.c.jl_Integer$.prototype.numberOfTrailingZeros__I__I = (function(i) {
  return this.bitCount__I__I((((-1) + (i & ((-i) | 0))) | 0))
});
ScalaJS.is.jl_Integer$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Integer$)))
});
ScalaJS.as.jl_Integer$ = (function(obj) {
  return ((ScalaJS.is.jl_Integer$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Integer$"))
});
ScalaJS.isArrayOf.jl_Integer$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer$)))
});
ScalaJS.asArrayOf.jl_Integer$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Integer$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Integer$;", depth))
});
ScalaJS.d.jl_Integer$ = new ScalaJS.ClassTypeData({
  jl_Integer$: 0
}, false, "java.lang.Integer$", ScalaJS.d.O, {
  jl_Integer$: 1,
  O: 1
});
ScalaJS.c.jl_Integer$.prototype.$classData = ScalaJS.d.jl_Integer$;
ScalaJS.n.jl_Integer$ = (void 0);
ScalaJS.m.jl_Integer$ = (function() {
  if ((!ScalaJS.n.jl_Integer$)) {
    ScalaJS.n.jl_Integer$ = new ScalaJS.c.jl_Integer$().init___()
  };
  return ScalaJS.n.jl_Integer$
});
/** @constructor */
ScalaJS.c.jl_Number = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.jl_Number.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Number.prototype.constructor = ScalaJS.c.jl_Number;
/** @constructor */
ScalaJS.h.jl_Number = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Number.prototype = ScalaJS.c.jl_Number.prototype;
ScalaJS.is.jl_Number = (function(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
});
ScalaJS.as.jl_Number = (function(obj) {
  return ((ScalaJS.is.jl_Number(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Number"))
});
ScalaJS.isArrayOf.jl_Number = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
});
ScalaJS.asArrayOf.jl_Number = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Number(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Number;", depth))
});
ScalaJS.d.jl_Number = new ScalaJS.ClassTypeData({
  jl_Number: 0
}, false, "java.lang.Number", ScalaJS.d.O, {
  jl_Number: 1,
  O: 1
}, ScalaJS.is.jl_Number);
ScalaJS.c.jl_Number.prototype.$classData = ScalaJS.d.jl_Number;
/** @constructor */
ScalaJS.c.jl_System$ = (function() {
  ScalaJS.c.O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
});
ScalaJS.c.jl_System$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_System$.prototype.constructor = ScalaJS.c.jl_System$;
/** @constructor */
ScalaJS.h.jl_System$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_System$.prototype = ScalaJS.c.jl_System$.prototype;
ScalaJS.c.jl_System$.prototype.init___ = (function() {
  ScalaJS.n.jl_System$ = this;
  this.out$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = ScalaJS.g["performance"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = ScalaJS.g["performance"]["now"];
    if (ScalaJS.uZ((!(!x$1)))) {
      var jsx$1 = (function(this$2$1) {
        return (function() {
          return ScalaJS.uD(ScalaJS.g["performance"]["now"]())
        })
      })(this)
    } else {
      var x$2 = ScalaJS.g["performance"]["webkitNow"];
      if (ScalaJS.uZ((!(!x$2)))) {
        var jsx$1 = (function(this$3$1) {
          return (function() {
            return ScalaJS.uD(ScalaJS.g["performance"]["webkitNow"]())
          })
        })(this)
      } else {
        var jsx$1 = (function(this$4$1) {
          return (function() {
            return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
          })
        })(this)
      }
    }
  } else {
    var jsx$1 = (function(this$5$1) {
      return (function() {
        return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
      })
    })(this)
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
ScalaJS.is.jl_System$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_System$)))
});
ScalaJS.as.jl_System$ = (function(obj) {
  return ((ScalaJS.is.jl_System$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.System$"))
});
ScalaJS.isArrayOf.jl_System$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_System$)))
});
ScalaJS.asArrayOf.jl_System$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_System$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.System$;", depth))
});
ScalaJS.d.jl_System$ = new ScalaJS.ClassTypeData({
  jl_System$: 0
}, false, "java.lang.System$", ScalaJS.d.O, {
  jl_System$: 1,
  O: 1
});
ScalaJS.c.jl_System$.prototype.$classData = ScalaJS.d.jl_System$;
ScalaJS.n.jl_System$ = (void 0);
ScalaJS.m.jl_System$ = (function() {
  if ((!ScalaJS.n.jl_System$)) {
    ScalaJS.n.jl_System$ = new ScalaJS.c.jl_System$().init___()
  };
  return ScalaJS.n.jl_System$
});
/** @constructor */
ScalaJS.c.jl_ThreadLocal = (function() {
  ScalaJS.c.O.call(this);
  this.hasValue$1 = null;
  this.v$1 = null
});
ScalaJS.c.jl_ThreadLocal.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_ThreadLocal.prototype.constructor = ScalaJS.c.jl_ThreadLocal;
/** @constructor */
ScalaJS.h.jl_ThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ThreadLocal.prototype = ScalaJS.c.jl_ThreadLocal.prototype;
ScalaJS.c.jl_ThreadLocal.prototype.init___ = (function() {
  this.hasValue$1 = false;
  return this
});
ScalaJS.c.jl_ThreadLocal.prototype.get__O = (function() {
  var x = this.hasValue$1;
  if ((!ScalaJS.uZ(x))) {
    this.set__O__V(this.initialValue__O())
  };
  return this.v$1
});
ScalaJS.c.jl_ThreadLocal.prototype.set__O__V = (function(o) {
  this.v$1 = o;
  this.hasValue$1 = true
});
ScalaJS.is.jl_ThreadLocal = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ThreadLocal)))
});
ScalaJS.as.jl_ThreadLocal = (function(obj) {
  return ((ScalaJS.is.jl_ThreadLocal(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.ThreadLocal"))
});
ScalaJS.isArrayOf.jl_ThreadLocal = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ThreadLocal)))
});
ScalaJS.asArrayOf.jl_ThreadLocal = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_ThreadLocal(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.ThreadLocal;", depth))
});
ScalaJS.d.jl_ThreadLocal = new ScalaJS.ClassTypeData({
  jl_ThreadLocal: 0
}, false, "java.lang.ThreadLocal", ScalaJS.d.O, {
  jl_ThreadLocal: 1,
  O: 1
});
ScalaJS.c.jl_ThreadLocal.prototype.$classData = ScalaJS.d.jl_ThreadLocal;
/** @constructor */
ScalaJS.c.s_DeprecatedConsole = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_DeprecatedConsole.prototype = new ScalaJS.h.O();
ScalaJS.c.s_DeprecatedConsole.prototype.constructor = ScalaJS.c.s_DeprecatedConsole;
/** @constructor */
ScalaJS.h.s_DeprecatedConsole = (function() {
  /*<skip>*/
});
ScalaJS.h.s_DeprecatedConsole.prototype = ScalaJS.c.s_DeprecatedConsole.prototype;
ScalaJS.is.s_DeprecatedConsole = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_DeprecatedConsole)))
});
ScalaJS.as.s_DeprecatedConsole = (function(obj) {
  return ((ScalaJS.is.s_DeprecatedConsole(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.DeprecatedConsole"))
});
ScalaJS.isArrayOf.s_DeprecatedConsole = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_DeprecatedConsole)))
});
ScalaJS.asArrayOf.s_DeprecatedConsole = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_DeprecatedConsole(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.DeprecatedConsole;", depth))
});
ScalaJS.d.s_DeprecatedConsole = new ScalaJS.ClassTypeData({
  s_DeprecatedConsole: 0
}, false, "scala.DeprecatedConsole", ScalaJS.d.O, {
  s_DeprecatedConsole: 1,
  O: 1
});
ScalaJS.c.s_DeprecatedConsole.prototype.$classData = ScalaJS.d.s_DeprecatedConsole;
/** @constructor */
ScalaJS.c.s_Predef$any2stringadd$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Predef$any2stringadd$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Predef$any2stringadd$.prototype.constructor = ScalaJS.c.s_Predef$any2stringadd$;
/** @constructor */
ScalaJS.h.s_Predef$any2stringadd$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Predef$any2stringadd$.prototype = ScalaJS.c.s_Predef$any2stringadd$.prototype;
ScalaJS.c.s_Predef$any2stringadd$.prototype.$$plus$extension__O__T__T = (function($$this, other) {
  return (("" + ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T($$this)) + other)
});
ScalaJS.is.s_Predef$any2stringadd$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Predef$any2stringadd$)))
});
ScalaJS.as.s_Predef$any2stringadd$ = (function(obj) {
  return ((ScalaJS.is.s_Predef$any2stringadd$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Predef$any2stringadd$"))
});
ScalaJS.isArrayOf.s_Predef$any2stringadd$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Predef$any2stringadd$)))
});
ScalaJS.asArrayOf.s_Predef$any2stringadd$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_Predef$any2stringadd$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Predef$any2stringadd$;", depth))
});
ScalaJS.d.s_Predef$any2stringadd$ = new ScalaJS.ClassTypeData({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", ScalaJS.d.O, {
  s_Predef$any2stringadd$: 1,
  O: 1
});
ScalaJS.c.s_Predef$any2stringadd$.prototype.$classData = ScalaJS.d.s_Predef$any2stringadd$;
ScalaJS.n.s_Predef$any2stringadd$ = (void 0);
ScalaJS.m.s_Predef$any2stringadd$ = (function() {
  if ((!ScalaJS.n.s_Predef$any2stringadd$)) {
    ScalaJS.n.s_Predef$any2stringadd$ = new ScalaJS.c.s_Predef$any2stringadd$().init___()
  };
  return ScalaJS.n.s_Predef$any2stringadd$
});
ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O = (function($$this, n) {
  switch (n) {
    case 0:
      {
        return $$this.$$und1$f;
        break
      };
    case 1:
      {
        return $$this.$$und2$f;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n));
  }
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable = (function() {
  ScalaJS.c.O.call(this);
  this.scala$util$DynamicVariable$$init$f = null;
  this.tl$1 = null
});
ScalaJS.c.s_util_DynamicVariable.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_DynamicVariable.prototype.constructor = ScalaJS.c.s_util_DynamicVariable;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable.prototype = ScalaJS.c.s_util_DynamicVariable.prototype;
ScalaJS.c.s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.tl$1.get__O()) + ")")
});
ScalaJS.c.s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.scala$util$DynamicVariable$$init$f = init;
  this.tl$1 = new ScalaJS.c.s_util_DynamicVariable$$anon$1().init___s_util_DynamicVariable(this);
  return this
});
ScalaJS.is.s_util_DynamicVariable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_DynamicVariable)))
});
ScalaJS.as.s_util_DynamicVariable = (function(obj) {
  return ((ScalaJS.is.s_util_DynamicVariable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.DynamicVariable"))
});
ScalaJS.isArrayOf.s_util_DynamicVariable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_DynamicVariable)))
});
ScalaJS.asArrayOf.s_util_DynamicVariable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_DynamicVariable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.DynamicVariable;", depth))
});
ScalaJS.d.s_util_DynamicVariable = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", ScalaJS.d.O, {
  s_util_DynamicVariable: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable.prototype.$classData = ScalaJS.d.s_util_DynamicVariable;
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3.prototype = ScalaJS.c.s_util_hashing_MurmurHash3.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = ScalaJS.imul((-862048943), k);
  k = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = ScalaJS.imul(461845907, k);
  return (hash ^ k)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + ScalaJS.imul(5, h)) | 0)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = ScalaJS.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = ScalaJS.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new ScalaJS.c.sr_IntRef().init___I(0);
  var b = new ScalaJS.c.sr_IntRef().init___I(0);
  var n = new ScalaJS.c.sr_IntRef().init___I(0);
  var c = new ScalaJS.c.sr_IntRef().init___I(1);
  xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = ScalaJS.imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new ScalaJS.c.sr_IntRef().init___I(0);
  var h = new ScalaJS.c.sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = this$2$1.mix__I__I__I(h$1.elem$1, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var tail = ScalaJS.as.sci_List(elems.tail__O());
    h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
ScalaJS.is.s_util_hashing_MurmurHash3 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_hashing_MurmurHash3)))
});
ScalaJS.as.s_util_hashing_MurmurHash3 = (function(obj) {
  return ((ScalaJS.is.s_util_hashing_MurmurHash3(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.hashing.MurmurHash3"))
});
ScalaJS.isArrayOf.s_util_hashing_MurmurHash3 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_hashing_MurmurHash3)))
});
ScalaJS.asArrayOf.s_util_hashing_MurmurHash3 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_hashing_MurmurHash3(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.hashing.MurmurHash3;", depth))
});
ScalaJS.d.s_util_hashing_MurmurHash3 = new ScalaJS.ClassTypeData({
  s_util_hashing_MurmurHash3: 0
}, false, "scala.util.hashing.MurmurHash3", ScalaJS.d.O, {
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.$classData = ScalaJS.d.s_util_hashing_MurmurHash3;
ScalaJS.s.sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z = (function($$this, x2$1) {
  try {
    var this$1 = new ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($$this.dict$5);
    var res = true;
    while ((res && this$1.hasNext__Z())) {
      var arg1 = this$1.next__T2();
      if ((arg1 !== null)) {
        var k = arg1.$$und1$f;
        var v = arg1.$$und2$f;
        var x1$2 = x2$1.get__T__s_Option(ScalaJS.as.T(k));
        matchEnd6: {
          if (ScalaJS.is.s_Some(x1$2)) {
            var x2 = ScalaJS.as.s_Some(x1$2);
            var p3 = x2.x$2;
            if (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
              res = true;
              break matchEnd6
            }
          };
          res = false;
          break matchEnd6
        }
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(arg1)
      }
    };
    return res
  } catch (e) {
    if (ScalaJS.is.jl_ClassCastException(e)) {
      ScalaJS.as.jl_ClassCastException(e);
      var this$3 = ScalaJS.m.s_Console$();
      var this$4 = this$3.outVar$2;
      ScalaJS.as.Ljava_io_PrintStream(this$4.tl$1.get__O()).println__O__V("class cast ");
      return false
    } else {
      throw e
    }
  }
});
ScalaJS.s.sc_GenMapLike$class__equals__sc_GenMapLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenMap(that)) {
    var x2 = ScalaJS.as.sc_GenMap(that);
    return (($$this === x2) || ((ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I($$this) === ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I(x2)) && ScalaJS.s.sc_GenMapLike$class__liftedTree1$1__p0__sc_GenMapLike__sc_GenMap__Z($$this, x2)))
  } else {
    return false
  }
});
ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenSeq(that)) {
    var x2 = ScalaJS.as.sc_GenSeq(that);
    return $$this.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if (ScalaJS.is.sc_IndexedSeq(that)) {
    var x2 = ScalaJS.as.sc_IndexedSeq(that);
    var len = $$this.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z($$this.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V = (function($$this, f) {
  var i = 0;
  var len = $$this.length__I();
  while ((i < len)) {
    f.apply__O__O($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z = (function($$this) {
  return ($$this.length__I() === 0)
});
ScalaJS.s.sc_IterableLike$class__isEmpty__sc_IterableLike__Z = (function($$this) {
  return (!$$this.iterator__sc_Iterator().hasNext__Z())
});
ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z = (function($$this, that) {
  var these = $$this.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
});
/** @constructor */
ScalaJS.c.sc_Iterator$ = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null
});
ScalaJS.c.sc_Iterator$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_Iterator$.prototype.constructor = ScalaJS.c.sc_Iterator$;
/** @constructor */
ScalaJS.h.sc_Iterator$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$.prototype = ScalaJS.c.sc_Iterator$.prototype;
ScalaJS.c.sc_Iterator$.prototype.init___ = (function() {
  ScalaJS.n.sc_Iterator$ = this;
  this.empty$1 = new ScalaJS.c.sc_Iterator$$anon$2().init___();
  return this
});
ScalaJS.is.sc_Iterator$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterator$)))
});
ScalaJS.as.sc_Iterator$ = (function(obj) {
  return ((ScalaJS.is.sc_Iterator$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.Iterator$"))
});
ScalaJS.isArrayOf.sc_Iterator$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator$)))
});
ScalaJS.asArrayOf.sc_Iterator$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_Iterator$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.Iterator$;", depth))
});
ScalaJS.d.sc_Iterator$ = new ScalaJS.ClassTypeData({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", ScalaJS.d.O, {
  sc_Iterator$: 1,
  O: 1
});
ScalaJS.c.sc_Iterator$.prototype.$classData = ScalaJS.d.sc_Iterator$;
ScalaJS.n.sc_Iterator$ = (void 0);
ScalaJS.m.sc_Iterator$ = (function() {
  if ((!ScalaJS.n.sc_Iterator$)) {
    ScalaJS.n.sc_Iterator$ = new ScalaJS.c.sc_Iterator$().init___()
  };
  return ScalaJS.n.sc_Iterator$
});
ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z = (function($$this) {
  return (!$$this.hasNext__Z())
});
ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T = (function($$this) {
  return (($$this.hasNext__Z() ? "non-empty" : "empty") + " iterator")
});
ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V = (function($$this, f) {
  while ($$this.hasNext__Z()) {
    f.apply__O__O($$this.next__O())
  }
});
ScalaJS.s.sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var this$2 = new ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($$this.dict$5);
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
    return (function(x0$1$2) {
      var x0$1 = ScalaJS.as.T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1$f;
        var v = x0$1.$$und2$f;
        return (("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new ScalaJS.c.s_MatchError().init___O(x0$1)
      }
    })
  })($$this));
  var this$3 = new ScalaJS.c.sc_Iterator$$anon$11().init___sc_Iterator__F1(this$2, f);
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
});
ScalaJS.s.sc_MapLike$class__isEmpty__sc_MapLike__Z = (function($$this) {
  return (ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I($$this) === 0)
});
ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T = (function($$this) {
  return $$this.mkString__T__T__T__T(($$this.stringPrefix__T() + "("), ", ", ")")
});
ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T = (function($$this) {
  var string = ScalaJS.objectGetClass($$this.repr__O()).getName__T();
  var idx1 = ScalaJS.m.sjsr_RuntimeString$().lastIndexOf__T__I__I(string, 46);
  if ((idx1 !== (-1))) {
    var thiz = string;
    var beginIndex = ((1 + idx1) | 0);
    string = ScalaJS.as.T(thiz["substring"](beginIndex))
  };
  var idx2 = ScalaJS.m.sjsr_RuntimeString$().indexOf__T__I__I(string, 36);
  if ((idx2 !== (-1))) {
    var thiz$1 = string;
    string = ScalaJS.as.T(thiz$1["substring"](0, idx2))
  };
  return string
});
ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var first = new ScalaJS.c.sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($$this, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
});
ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T = (function($$this, start, sep, end) {
  var this$1 = $$this.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new ScalaJS.c.scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
});
ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z = (function($$this) {
  return (!$$this.isEmpty__Z())
});
ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I = (function($$this) {
  var result = new ScalaJS.c.sr_IntRef().init___I(0);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($$this, result)));
  return result.elem$1
});
ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V = (function($$this, xs) {
  x: {
    _loop: while (true) {
      var this$1 = xs;
      if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        $$this.$$plus$eq__O__scg_Growable(xs.head__O());
        xs = ScalaJS.as.sc_LinearSeq(xs.tail__O());
        continue _loop
      };
      break x
    }
  }
});
ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable = (function($$this, xs) {
  if (ScalaJS.is.sc_LinearSeq(xs)) {
    var x2 = ScalaJS.as.sc_LinearSeq(xs);
    ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, x2)
  } else {
    xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
      return (function(elem$2) {
        return $$this$1.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($$this)))
  };
  return $$this
});
ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V = (function($$this, coll) {
  if (ScalaJS.is.sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(coll.size__I())
  }
});
/** @constructor */
ScalaJS.c.sjs_js_Dictionary$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjs_js_Dictionary$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjs_js_Dictionary$.prototype.constructor = ScalaJS.c.sjs_js_Dictionary$;
/** @constructor */
ScalaJS.h.sjs_js_Dictionary$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_Dictionary$.prototype = ScalaJS.c.sjs_js_Dictionary$.prototype;
ScalaJS.c.sjs_js_Dictionary$.prototype.empty__sjs_js_Dictionary = (function() {
  return {}
});
ScalaJS.is.sjs_js_Dictionary$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_Dictionary$)))
});
ScalaJS.as.sjs_js_Dictionary$ = (function(obj) {
  return ((ScalaJS.is.sjs_js_Dictionary$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.Dictionary$"))
});
ScalaJS.isArrayOf.sjs_js_Dictionary$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_Dictionary$)))
});
ScalaJS.asArrayOf.sjs_js_Dictionary$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_Dictionary$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.Dictionary$;", depth))
});
ScalaJS.d.sjs_js_Dictionary$ = new ScalaJS.ClassTypeData({
  sjs_js_Dictionary$: 0
}, false, "scala.scalajs.js.Dictionary$", ScalaJS.d.O, {
  sjs_js_Dictionary$: 1,
  O: 1
});
ScalaJS.c.sjs_js_Dictionary$.prototype.$classData = ScalaJS.d.sjs_js_Dictionary$;
ScalaJS.n.sjs_js_Dictionary$ = (void 0);
ScalaJS.m.sjs_js_Dictionary$ = (function() {
  if ((!ScalaJS.n.sjs_js_Dictionary$)) {
    ScalaJS.n.sjs_js_Dictionary$ = new ScalaJS.c.sjs_js_Dictionary$().init___()
  };
  return ScalaJS.n.sjs_js_Dictionary$
});
/** @constructor */
ScalaJS.c.sjs_js_WrappedDictionary$Cache$ = (function() {
  ScalaJS.c.O.call(this);
  this.safeHasOwnProperty$1 = null
});
ScalaJS.c.sjs_js_WrappedDictionary$Cache$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjs_js_WrappedDictionary$Cache$.prototype.constructor = ScalaJS.c.sjs_js_WrappedDictionary$Cache$;
/** @constructor */
ScalaJS.h.sjs_js_WrappedDictionary$Cache$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedDictionary$Cache$.prototype = ScalaJS.c.sjs_js_WrappedDictionary$Cache$.prototype;
ScalaJS.c.sjs_js_WrappedDictionary$Cache$.prototype.init___ = (function() {
  ScalaJS.n.sjs_js_WrappedDictionary$Cache$ = this;
  this.safeHasOwnProperty$1 = ScalaJS.g["Object"]["prototype"]["hasOwnProperty"];
  return this
});
ScalaJS.is.sjs_js_WrappedDictionary$Cache$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedDictionary$Cache$)))
});
ScalaJS.as.sjs_js_WrappedDictionary$Cache$ = (function(obj) {
  return ((ScalaJS.is.sjs_js_WrappedDictionary$Cache$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.WrappedDictionary$Cache$"))
});
ScalaJS.isArrayOf.sjs_js_WrappedDictionary$Cache$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedDictionary$Cache$)))
});
ScalaJS.asArrayOf.sjs_js_WrappedDictionary$Cache$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_WrappedDictionary$Cache$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.WrappedDictionary$Cache$;", depth))
});
ScalaJS.d.sjs_js_WrappedDictionary$Cache$ = new ScalaJS.ClassTypeData({
  sjs_js_WrappedDictionary$Cache$: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", ScalaJS.d.O, {
  sjs_js_WrappedDictionary$Cache$: 1,
  O: 1
});
ScalaJS.c.sjs_js_WrappedDictionary$Cache$.prototype.$classData = ScalaJS.d.sjs_js_WrappedDictionary$Cache$;
ScalaJS.n.sjs_js_WrappedDictionary$Cache$ = (void 0);
ScalaJS.m.sjs_js_WrappedDictionary$Cache$ = (function() {
  if ((!ScalaJS.n.sjs_js_WrappedDictionary$Cache$)) {
    ScalaJS.n.sjs_js_WrappedDictionary$Cache$ = new ScalaJS.c.sjs_js_WrappedDictionary$Cache$().init___()
  };
  return ScalaJS.n.sjs_js_WrappedDictionary$Cache$
});
/** @constructor */
ScalaJS.c.sjsr_Bits$ = (function() {
  ScalaJS.c.O.call(this);
  this.areTypedArraysSupported$1 = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
});
ScalaJS.c.sjsr_Bits$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_Bits$.prototype.constructor = ScalaJS.c.sjsr_Bits$;
/** @constructor */
ScalaJS.h.sjsr_Bits$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_Bits$.prototype = ScalaJS.c.sjsr_Bits$.prototype;
ScalaJS.c.sjsr_Bits$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_Bits$ = this;
  var x = (((ScalaJS.g["ArrayBuffer"] && ScalaJS.g["Int32Array"]) && ScalaJS.g["Float32Array"]) && ScalaJS.g["Float64Array"]);
  this.areTypedArraysSupported$1 = ScalaJS.uZ((!(!x)));
  this.arrayBuffer$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["ArrayBuffer"](8) : null);
  this.int32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Int32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float64Array"](this.arrayBuffer$1, 0, 1) : null);
  if ((!this.areTypedArraysSupported$1)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = (ScalaJS.uB(new ScalaJS.g["Int8Array"](this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
ScalaJS.c.sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = (value | 0);
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return this$1.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this$1.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
  }
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1022))))) {
      var twoPowFbits = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 52));
      var a = (ScalaJS.uD(ScalaJS.g["Math"]["log"](av)) / 0.6931471805599453);
      var a$1 = (ScalaJS.uD(ScalaJS.g["Math"]["floor"](a)) | 0);
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, b))) * twoPowFbits);
      var w = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1074))));
      var w$1 = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = ScalaJS.uZ(x1_$_$$und1$1);
  var e$1 = ScalaJS.uI(x1_$_$$und2$1);
  var f$3 = ScalaJS.uD(x1_$_$$und3$1);
  var x$2_$_$$und1$1 = s$1;
  var x$2_$_$$und2$1 = e$1;
  var x$2_$_$$und3$1 = f$3;
  var s$2 = ScalaJS.uZ(x$2_$_$$und1$1);
  var e$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var f$2$1 = ScalaJS.uD(x$2_$_$$und3$1);
  var hif = ((f$2$1 / 4.294967296E9) | 0);
  var hi = (((s$2 ? (-2147483648) : 0) | (e$2 << 20)) | hif);
  var lo = (f$2$1 | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(lo)))
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.areTypedArraysSupported$1) {
    this.float64Array$1[0] = value;
    return new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
ScalaJS.is.sjsr_Bits$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_Bits$)))
});
ScalaJS.as.sjsr_Bits$ = (function(obj) {
  return ((ScalaJS.is.sjsr_Bits$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.Bits$"))
});
ScalaJS.isArrayOf.sjsr_Bits$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_Bits$)))
});
ScalaJS.asArrayOf.sjsr_Bits$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_Bits$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.Bits$;", depth))
});
ScalaJS.d.sjsr_Bits$ = new ScalaJS.ClassTypeData({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", ScalaJS.d.O, {
  sjsr_Bits$: 1,
  O: 1
});
ScalaJS.c.sjsr_Bits$.prototype.$classData = ScalaJS.d.sjsr_Bits$;
ScalaJS.n.sjsr_Bits$ = (void 0);
ScalaJS.m.sjsr_Bits$ = (function() {
  if ((!ScalaJS.n.sjsr_Bits$)) {
    ScalaJS.n.sjsr_Bits$ = new ScalaJS.c.sjsr_Bits$().init___()
  };
  return ScalaJS.n.sjsr_Bits$
});
/** @constructor */
ScalaJS.c.sjsr_RuntimeString$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_RuntimeString$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeString$.prototype.constructor = ScalaJS.c.sjsr_RuntimeString$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeString$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeString$.prototype = ScalaJS.c.sjsr_RuntimeString$.prototype;
ScalaJS.c.sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : ScalaJS.objectToString(value))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["lastIndexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["indexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    var array = [codePoint];
    var x = ScalaJS.g["String"];
    var jsx$4 = x["fromCharCode"];
    matchEnd5: {
      var jsx$3;
      var jsx$3 = array;
      break matchEnd5
    };
    var jsx$2 = []["concat"](jsx$3);
    var jsx$1 = jsx$4["apply"](x, jsx$2);
    return ScalaJS.as.T(jsx$1)
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    var array$1 = [(55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))];
    var x$1 = ScalaJS.g["String"];
    var jsx$8 = x$1["fromCharCode"];
    matchEnd5$1: {
      var jsx$7;
      var jsx$7 = array$1;
      break matchEnd5$1
    };
    var jsx$6 = []["concat"](jsx$7);
    var jsx$5 = jsx$8["apply"](x$1, jsx$6);
    return ScalaJS.as.T(jsx$5)
  }
});
ScalaJS.c.sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + ScalaJS.uI(thiz["length"])) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + ScalaJS.imul((65535 & ScalaJS.uI(thiz["charCodeAt"](index))), mul)) | 0);
    mul = ScalaJS.imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
ScalaJS.is.sjsr_RuntimeString$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeString$)))
});
ScalaJS.as.sjsr_RuntimeString$ = (function(obj) {
  return ((ScalaJS.is.sjsr_RuntimeString$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.RuntimeString$"))
});
ScalaJS.isArrayOf.sjsr_RuntimeString$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeString$)))
});
ScalaJS.asArrayOf.sjsr_RuntimeString$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_RuntimeString$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeString$;", depth))
});
ScalaJS.d.sjsr_RuntimeString$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", ScalaJS.d.O, {
  sjsr_RuntimeString$: 1,
  O: 1
});
ScalaJS.c.sjsr_RuntimeString$.prototype.$classData = ScalaJS.d.sjsr_RuntimeString$;
ScalaJS.n.sjsr_RuntimeString$ = (void 0);
ScalaJS.m.sjsr_RuntimeString$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeString$)) {
    ScalaJS.n.sjsr_RuntimeString$ = new ScalaJS.c.sjsr_RuntimeString$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeString$
});
/** @constructor */
ScalaJS.c.sjsr_StackTrace$ = (function() {
  ScalaJS.c.O.call(this);
  this.isRhino$1 = false;
  this.decompressedClasses$1 = null;
  this.decompressedPrefixes$1 = null;
  this.compressedPrefixes$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.sjsr_StackTrace$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_StackTrace$.prototype.constructor = ScalaJS.c.sjsr_StackTrace$;
/** @constructor */
ScalaJS.h.sjsr_StackTrace$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_StackTrace$.prototype = ScalaJS.c.sjsr_StackTrace$.prototype;
ScalaJS.c.sjsr_StackTrace$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_StackTrace$ = this;
  var dict = {
    "O": "java_lang_Object",
    "T": "java_lang_String",
    "V": "scala_Unit",
    "Z": "scala_Boolean",
    "C": "scala_Char",
    "B": "scala_Byte",
    "S": "scala_Short",
    "I": "scala_Int",
    "J": "scala_Long",
    "F": "scala_Float",
    "D": "scala_Double"
  };
  var index = 0;
  while ((index <= 22)) {
    if ((index >= 2)) {
      dict[("T" + index)] = ("scala_Tuple" + index)
    };
    dict[("F" + index)] = ("scala_Function" + index);
    index = ((1 + index) | 0)
  };
  this.decompressedClasses$1 = dict;
  this.decompressedPrefixes$1 = {
    "sjsr_": "scala_scalajs_runtime_",
    "sjs_": "scala_scalajs_",
    "sci_": "scala_collection_immutable_",
    "scm_": "scala_collection_mutable_",
    "scg_": "scala_collection_generic_",
    "sc_": "scala_collection_",
    "sr_": "scala_runtime_",
    "s_": "scala_",
    "jl_": "java_lang_",
    "ju_": "java_util_"
  };
  this.compressedPrefixes$1 = ScalaJS.g["Object"]["keys"](this.decompressedPrefixes$1);
  return this
});
ScalaJS.c.sjsr_StackTrace$.prototype.createException__p1__O = (function() {
  try {
    return this["undef"]()
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if (ScalaJS.is.sjs_js_JavaScriptException(e$2)) {
        var x5 = ScalaJS.as.sjs_js_JavaScriptException(e$2);
        var e$3 = x5.exception$4;
        return e$3
      } else {
        throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
ScalaJS.c.sjsr_StackTrace$.prototype.captureState__jl_Throwable__O__V = (function(throwable, e) {
  throwable["stackdata"] = e
});
ScalaJS.is.sjsr_StackTrace$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_StackTrace$)))
});
ScalaJS.as.sjsr_StackTrace$ = (function(obj) {
  return ((ScalaJS.is.sjsr_StackTrace$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.StackTrace$"))
});
ScalaJS.isArrayOf.sjsr_StackTrace$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_StackTrace$)))
});
ScalaJS.asArrayOf.sjsr_StackTrace$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_StackTrace$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.StackTrace$;", depth))
});
ScalaJS.d.sjsr_StackTrace$ = new ScalaJS.ClassTypeData({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", ScalaJS.d.O, {
  sjsr_StackTrace$: 1,
  O: 1
});
ScalaJS.c.sjsr_StackTrace$.prototype.$classData = ScalaJS.d.sjsr_StackTrace$;
ScalaJS.n.sjsr_StackTrace$ = (void 0);
ScalaJS.m.sjsr_StackTrace$ = (function() {
  if ((!ScalaJS.n.sjsr_StackTrace$)) {
    ScalaJS.n.sjsr_StackTrace$ = new ScalaJS.c.sjsr_StackTrace$().init___()
  };
  return ScalaJS.n.sjsr_StackTrace$
});
/** @constructor */
ScalaJS.c.sjsr_package$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_package$.prototype.constructor = ScalaJS.c.sjsr_package$;
/** @constructor */
ScalaJS.h.sjsr_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_package$.prototype = ScalaJS.c.sjsr_package$.prototype;
ScalaJS.c.sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if (ScalaJS.is.sjs_js_JavaScriptException(th)) {
    var x2 = ScalaJS.as.sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
ScalaJS.c.sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if (ScalaJS.is.jl_Throwable(e)) {
    var x2 = ScalaJS.as.jl_Throwable(e);
    return x2
  } else {
    return new ScalaJS.c.sjs_js_JavaScriptException().init___O(e)
  }
});
ScalaJS.is.sjsr_package$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_package$)))
});
ScalaJS.as.sjsr_package$ = (function(obj) {
  return ((ScalaJS.is.sjsr_package$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.package$"))
});
ScalaJS.isArrayOf.sjsr_package$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_package$)))
});
ScalaJS.asArrayOf.sjsr_package$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_package$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.package$;", depth))
});
ScalaJS.d.sjsr_package$ = new ScalaJS.ClassTypeData({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", ScalaJS.d.O, {
  sjsr_package$: 1,
  O: 1
});
ScalaJS.c.sjsr_package$.prototype.$classData = ScalaJS.d.sjsr_package$;
ScalaJS.n.sjsr_package$ = (void 0);
ScalaJS.m.sjsr_package$ = (function() {
  if ((!ScalaJS.n.sjsr_package$)) {
    ScalaJS.n.sjsr_package$ = new ScalaJS.c.sjsr_package$().init___()
  };
  return ScalaJS.n.sjsr_package$
});
ScalaJS.isArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
});
ScalaJS.asArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
});
ScalaJS.d.sr_BoxedUnit = new ScalaJS.ClassTypeData({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", ScalaJS.d.O, {
  sr_BoxedUnit: 1,
  O: 1
}, (function(x) {
  return (x === (void 0))
}));
/** @constructor */
ScalaJS.c.sr_BoxesRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_BoxesRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BoxesRunTime$.prototype.constructor = ScalaJS.c.sr_BoxesRunTime$;
/** @constructor */
ScalaJS.h.sr_BoxesRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BoxesRunTime$.prototype = ScalaJS.c.sr_BoxesRunTime$.prototype;
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if (ScalaJS.is.jl_Character(y)) {
    var x2 = ScalaJS.as.jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if (ScalaJS.is.jl_Number(y)) {
    var x3 = ScalaJS.as.jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = ScalaJS.uD(x3);
      return (x2$1 === xc.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(x3)) {
      var x3$1 = ScalaJS.uJ(x3);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(xc.value$1))
    } else {
      return ((x3 === null) ? (xc === null) : ScalaJS.objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if (ScalaJS.is.jl_Number(y)) {
    var x2 = ScalaJS.as.jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if (ScalaJS.is.jl_Character(y)) {
    var x3 = ScalaJS.as.jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = ScalaJS.uD(xn);
      return (x2$1 === x3.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
      var x3$1 = ScalaJS.uJ(xn);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(x3.value$1))
    } else {
      return ((xn === null) ? (x3 === null) : ScalaJS.objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : ScalaJS.objectEquals(xn, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if (ScalaJS.is.jl_Number(x)) {
    var x2 = ScalaJS.as.jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if (ScalaJS.is.jl_Character(x)) {
    var x3 = ScalaJS.as.jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : ScalaJS.objectEquals(x, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = ScalaJS.uJ(n).toInt__I();
  return (new ScalaJS.c.sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z(ScalaJS.uJ(n)) ? iv : ScalaJS.uJ(n).$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(ScalaJS.uJ(n).$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I())
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if (ScalaJS.isInt(n)) {
    var x2 = ScalaJS.uI(n);
    return x2
  } else if (ScalaJS.is.sjsr_RuntimeLong(n)) {
    var x3 = ScalaJS.as.sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = ScalaJS.asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return ScalaJS.objectHashCode(n)
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = ScalaJS.uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = ScalaJS.uD(yn);
      return (x2 === x2$2)
    } else if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x3 = ScalaJS.uJ(yn);
      return (x2 === x3.toDouble__D())
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
    var x3$2 = ScalaJS.uJ(xn);
    if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x2$3 = ScalaJS.uJ(yn);
      return x3$2.equals__sjsr_RuntimeLong__Z(x2$3)
    } else if (((typeof yn) === "number")) {
      var x3$3 = ScalaJS.uD(yn);
      return (x3$2.toDouble__D() === x3$3)
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4$2 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(x3$2)
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : ScalaJS.objectEquals(xn, yn))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.unboxToChar__O__C = (function(c) {
  if ((c === null)) {
    return 0
  } else {
    var this$1 = ScalaJS.as.jl_Character(c);
    return this$1.value$1
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = (ScalaJS.uD(n) | 0);
  var dv = ScalaJS.uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(ScalaJS.uD(n));
    return ((lv.toDouble__D() === dv) ? lv.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(lv.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I() : ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(ScalaJS.uD(n)))
  }
});
ScalaJS.is.sr_BoxesRunTime$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_BoxesRunTime$)))
});
ScalaJS.as.sr_BoxesRunTime$ = (function(obj) {
  return ((ScalaJS.is.sr_BoxesRunTime$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.BoxesRunTime$"))
});
ScalaJS.isArrayOf.sr_BoxesRunTime$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxesRunTime$)))
});
ScalaJS.asArrayOf.sr_BoxesRunTime$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_BoxesRunTime$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.BoxesRunTime$;", depth))
});
ScalaJS.d.sr_BoxesRunTime$ = new ScalaJS.ClassTypeData({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", ScalaJS.d.O, {
  sr_BoxesRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_BoxesRunTime$.prototype.$classData = ScalaJS.d.sr_BoxesRunTime$;
ScalaJS.n.sr_BoxesRunTime$ = (void 0);
ScalaJS.m.sr_BoxesRunTime$ = (function() {
  if ((!ScalaJS.n.sr_BoxesRunTime$)) {
    ScalaJS.n.sr_BoxesRunTime$ = new ScalaJS.c.sr_BoxesRunTime$().init___()
  };
  return ScalaJS.n.sr_BoxesRunTime$
});
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_ScalaRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_ScalaRunTime$.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$.prototype = ScalaJS.c.sr_ScalaRunTime$.prototype;
ScalaJS.c.sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : (ScalaJS.is.jl_Number(x) ? ScalaJS.m.sr_BoxesRunTime$().hashFromNumber__jl_Number__I(ScalaJS.as.jl_Number(x)) : ScalaJS.objectHashCode(x)))
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, ",", ")")
});
ScalaJS.is.sr_ScalaRunTime$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_ScalaRunTime$)))
});
ScalaJS.as.sr_ScalaRunTime$ = (function(obj) {
  return ((ScalaJS.is.sr_ScalaRunTime$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.ScalaRunTime$"))
});
ScalaJS.isArrayOf.sr_ScalaRunTime$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_ScalaRunTime$)))
});
ScalaJS.asArrayOf.sr_ScalaRunTime$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_ScalaRunTime$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.ScalaRunTime$;", depth))
});
ScalaJS.d.sr_ScalaRunTime$ = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", ScalaJS.d.O, {
  sr_ScalaRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$;
ScalaJS.n.sr_ScalaRunTime$ = (void 0);
ScalaJS.m.sr_ScalaRunTime$ = (function() {
  if ((!ScalaJS.n.sr_ScalaRunTime$)) {
    ScalaJS.n.sr_ScalaRunTime$ = new ScalaJS.c.sr_ScalaRunTime$().init___()
  };
  return ScalaJS.n.sr_ScalaRunTime$
});
/** @constructor */
ScalaJS.c.LChromi3wm$Content = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.up$2 = null;
  this.workspaces$2 = null
});
ScalaJS.c.LChromi3wm$Content.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Content.prototype.constructor = ScalaJS.c.LChromi3wm$Content;
/** @constructor */
ScalaJS.h.LChromi3wm$Content = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Content.prototype = ScalaJS.c.LChromi3wm$Content.prototype;
ScalaJS.c.LChromi3wm$Content.prototype.$$js$exported$prop$workspaces__O = (function() {
  return this.workspaces$2
});
ScalaJS.c.LChromi3wm$Content.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Content.prototype.toString__T = (function() {
  return ((((("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(this.up$2, ".Content#")) + ScalaJS.uI(this.c$1["id"])) + "'") + ScalaJS.as.T(this.c$1["name"])) + "'")
});
ScalaJS.c.LChromi3wm$Content.prototype.init___LChromi3wm$Container__LChromi3wm$Output = (function(c, up) {
  this.up$2 = up;
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "con", "content", false);
  var array = this.c$1["nodes"];
  var array$1 = [];
  ScalaJS.uI(array["length"]);
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    var elem = new ScalaJS.c.LChromi3wm$Workspace().init___LChromi3wm$Container__LChromi3wm$Content(arg1, this);
    array$1["push"](elem);
    i = ((1 + i) | 0)
  };
  this.workspaces$2 = array$1;
  return this
});
ScalaJS.c.LChromi3wm$Content.prototype.$$js$exported$prop$up__O = (function() {
  return this.up$2
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Content.prototype, "up", {
  "get": (function() {
    return this.$$js$exported$prop$up__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Content.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Content.prototype, "workspaces", {
  "get": (function() {
    return this.$$js$exported$prop$workspaces__O()
  }),
  "enumerable": true
});
ScalaJS.is.LChromi3wm$Content = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Content)))
});
ScalaJS.as.LChromi3wm$Content = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Content(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Content"))
});
ScalaJS.isArrayOf.LChromi3wm$Content = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Content)))
});
ScalaJS.asArrayOf.LChromi3wm$Content = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Content(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Content;", depth))
});
ScalaJS.d.LChromi3wm$Content = new ScalaJS.ClassTypeData({
  LChromi3wm$Content: 0
}, false, "Chromi3wm$Content", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Content: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Content.prototype.$classData = ScalaJS.d.LChromi3wm$Content;
/** @constructor */
ScalaJS.c.LChromi3wm$Dock = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.up$2 = null
});
ScalaJS.c.LChromi3wm$Dock.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Dock.prototype.constructor = ScalaJS.c.LChromi3wm$Dock;
/** @constructor */
ScalaJS.h.LChromi3wm$Dock = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Dock.prototype = ScalaJS.c.LChromi3wm$Dock.prototype;
ScalaJS.c.LChromi3wm$Dock.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Dock.prototype.toString__T = (function() {
  return ((((("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(this.up$2, ".Dock#")) + ScalaJS.uI(this.c$1["id"])) + "'") + ScalaJS.as.T(this.c$1["name"])) + "'")
});
ScalaJS.c.LChromi3wm$Dock.prototype.init___LChromi3wm$Container__LChromi3wm$Output = (function(c, up) {
  this.up$2 = up;
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "dockarea", null, false);
  if (((this.x1__I() !== up.x1__I()) || (this.x2__I() !== up.x2__I()))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("not full width")))
  };
  if (((ScalaJS.as.T(this.c$1["name"]) === "topdock") && ((this.y1__I() !== up.y1__I()) || (this.y2__I() >= up.y2__I())))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("topdock not at top")))
  };
  if (((ScalaJS.as.T(this.c$1["name"]) === "bottomdock") && ((this.y1__I() <= up.y1__I()) || (this.y2__I() !== up.y2__I())))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("bottomdock not at bottom")))
  };
  return this
});
ScalaJS.c.LChromi3wm$Dock.prototype.$$js$exported$prop$up__O = (function() {
  return this.up$2
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Dock.prototype, "up", {
  "get": (function() {
    return this.$$js$exported$prop$up__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Dock.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
ScalaJS.is.LChromi3wm$Dock = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Dock)))
});
ScalaJS.as.LChromi3wm$Dock = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Dock(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Dock"))
});
ScalaJS.isArrayOf.LChromi3wm$Dock = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Dock)))
});
ScalaJS.asArrayOf.LChromi3wm$Dock = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Dock(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Dock;", depth))
});
ScalaJS.d.LChromi3wm$Dock = new ScalaJS.ClassTypeData({
  LChromi3wm$Dock: 0
}, false, "Chromi3wm$Dock", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Dock: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Dock.prototype.$classData = ScalaJS.d.LChromi3wm$Dock;
/** @constructor */
ScalaJS.c.LChromi3wm$Output = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.up$2 = null;
  this.preowned$2 = null;
  this.topdock$2 = null;
  this.bottomdock$2 = null;
  this.content$2 = null;
  this.unclaimed$2 = null
});
ScalaJS.c.LChromi3wm$Output.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Output.prototype.constructor = ScalaJS.c.LChromi3wm$Output;
/** @constructor */
ScalaJS.h.LChromi3wm$Output = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Output.prototype = ScalaJS.c.LChromi3wm$Output.prototype;
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$preowned__O = (function() {
  return this.preowned$2
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$content__O = (function() {
  return this.content$2
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Output.prototype.toString__T = (function() {
  return ((((("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(this.up$2, ".Output#")) + ScalaJS.uI(this.c$1["id"])) + "'") + ScalaJS.as.T(this.c$1["name"])) + "'")
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$unclaimed__O = (function() {
  return this.unclaimed$2
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$topdock__O = (function() {
  return this.topdock$2
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$up__O = (function() {
  return this.up$2
});
ScalaJS.c.LChromi3wm$Output.prototype.unique__T__F2__sjs_js_UndefOr = (function(named, build) {
  var array = this.c$1["nodes"];
  var array$1 = [];
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    if (ScalaJS.m.LChromi3wm$().matches__LChromi3wm$Container__T__T__Z__Z(arg1, null, named, false)) {
      array$1["push"](arg1)
    };
    i = ((1 + i) | 0)
  };
  if ((ScalaJS.uI(array$1["length"]) !== 1)) {
    return (void 0)
  } else {
    ScalaJS.m.LChromi3wm$().claimOwned__LChromi3wm$Container__V(array$1[0]);
    var value = build.apply__O__O__O(array$1[0], this);
    return value
  }
});
ScalaJS.c.LChromi3wm$Output.prototype.init___LChromi3wm$Container__LChromi3wm$Root = (function(c, up) {
  this.up$2 = up;
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "output", null, false);
  var array = this.c$1["nodes"];
  var array$1 = [];
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    if (ScalaJS.m.LChromi3wm$().isOwned__LChromi3wm$Container__Z(arg1)) {
      array$1["push"](arg1)
    };
    i = ((1 + i) | 0)
  };
  this.preowned$2 = array$1;
  var array$2 = this.c$1["nodes"];
  var array$3 = [];
  var i$1 = 0;
  var len$1 = ScalaJS.uI(array$2["length"]);
  while ((i$1 < len$1)) {
    var index$1 = i$1;
    var arg1$1 = array$2[index$1];
    if (ScalaJS.m.LChromi3wm$().matches__LChromi3wm$Container__T__T__Z__Z(arg1$1, null, "topdock", false)) {
      array$3["push"](arg1$1)
    };
    i$1 = ((1 + i$1) | 0)
  };
  if ((ScalaJS.uI(array$3["length"]) !== 1)) {
    var jsx$1 = (void 0)
  } else {
    ScalaJS.m.LChromi3wm$().claimOwned__LChromi3wm$Container__V(array$3[0]);
    var arg1$2 = array$3[0];
    var value = new ScalaJS.c.LChromi3wm$Dock().init___LChromi3wm$Container__LChromi3wm$Output(arg1$2, this);
    var jsx$1 = value
  };
  this.topdock$2 = jsx$1;
  var array$4 = this.c$1["nodes"];
  var array$5 = [];
  var i$2 = 0;
  var len$2 = ScalaJS.uI(array$4["length"]);
  while ((i$2 < len$2)) {
    var index$2 = i$2;
    var arg1$3 = array$4[index$2];
    if (ScalaJS.m.LChromi3wm$().matches__LChromi3wm$Container__T__T__Z__Z(arg1$3, null, "bottomdock", false)) {
      array$5["push"](arg1$3)
    };
    i$2 = ((1 + i$2) | 0)
  };
  if ((ScalaJS.uI(array$5["length"]) !== 1)) {
    var jsx$2 = (void 0)
  } else {
    ScalaJS.m.LChromi3wm$().claimOwned__LChromi3wm$Container__V(array$5[0]);
    var arg1$4 = array$5[0];
    var value$1 = new ScalaJS.c.LChromi3wm$Dock().init___LChromi3wm$Container__LChromi3wm$Output(arg1$4, this);
    var jsx$2 = value$1
  };
  this.bottomdock$2 = jsx$2;
  var array$6 = this.c$1["nodes"];
  var array$7 = [];
  var i$3 = 0;
  var len$3 = ScalaJS.uI(array$6["length"]);
  while ((i$3 < len$3)) {
    var index$3 = i$3;
    var arg1$5 = array$6[index$3];
    if (ScalaJS.m.LChromi3wm$().matches__LChromi3wm$Container__T__T__Z__Z(arg1$5, null, "content", false)) {
      array$7["push"](arg1$5)
    };
    i$3 = ((1 + i$3) | 0)
  };
  if ((ScalaJS.uI(array$7["length"]) !== 1)) {
    var jsx$3 = (void 0)
  } else {
    ScalaJS.m.LChromi3wm$().claimOwned__LChromi3wm$Container__V(array$7[0]);
    var arg1$6 = array$7[0];
    var value$2 = new ScalaJS.c.LChromi3wm$Content().init___LChromi3wm$Container__LChromi3wm$Output(arg1$6, this);
    var jsx$3 = value$2
  };
  this.content$2 = jsx$3;
  var array$8 = this.c$1["nodes"];
  var array$9 = [];
  var i$4 = 0;
  var len$4 = ScalaJS.uI(array$8["length"]);
  while ((i$4 < len$4)) {
    var index$4 = i$4;
    var arg1$7 = array$8[index$4];
    if ((!ScalaJS.m.LChromi3wm$().isOwned__LChromi3wm$Container__Z(arg1$7))) {
      array$9["push"](arg1$7)
    };
    i$4 = ((1 + i$4) | 0)
  };
  this.unclaimed$2 = array$9;
  var $$this = this.content$2;
  if (($$this === (void 0))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("no content")))
  };
  var array$10 = this.preowned$2;
  if ((ScalaJS.uI(array$10["length"]) !== 0)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("preowned nodes")))
  };
  var array$11 = this.unclaimed$2;
  if ((ScalaJS.uI(array$11["length"]) !== 0)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("unclaimed nodes")))
  };
  return this
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$meth$unique__T__F2__O = (function(named, build) {
  return this.unique__T__F2__sjs_js_UndefOr(named, build)
});
ScalaJS.c.LChromi3wm$Output.prototype.$$js$exported$prop$bottomdock__O = (function() {
  return this.bottomdock$2
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "up", {
  "get": (function() {
    return this.$$js$exported$prop$up__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Output.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "preowned", {
  "get": (function() {
    return this.$$js$exported$prop$preowned__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "topdock", {
  "get": (function() {
    return this.$$js$exported$prop$topdock__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "bottomdock", {
  "get": (function() {
    return this.$$js$exported$prop$bottomdock__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "content", {
  "get": (function() {
    return this.$$js$exported$prop$content__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Output.prototype, "unclaimed", {
  "get": (function() {
    return this.$$js$exported$prop$unclaimed__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Output.prototype["unique"] = (function(arg$1, arg$2) {
  var preparg$1 = ScalaJS.as.T(arg$1);
  var preparg$2 = ScalaJS.as.F2(arg$2);
  return this.$$js$exported$meth$unique__T__F2__O(preparg$1, preparg$2)
});
ScalaJS.is.LChromi3wm$Output = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Output)))
});
ScalaJS.as.LChromi3wm$Output = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Output(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Output"))
});
ScalaJS.isArrayOf.LChromi3wm$Output = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Output)))
});
ScalaJS.asArrayOf.LChromi3wm$Output = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Output(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Output;", depth))
});
ScalaJS.d.LChromi3wm$Output = new ScalaJS.ClassTypeData({
  LChromi3wm$Output: 0
}, false, "Chromi3wm$Output", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Output: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Output.prototype.$classData = ScalaJS.d.LChromi3wm$Output;
/** @constructor */
ScalaJS.c.LChromi3wm$Root = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.outputs$2 = null;
  this.workspaces$2 = null
});
ScalaJS.c.LChromi3wm$Root.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Root.prototype.constructor = ScalaJS.c.LChromi3wm$Root;
/** @constructor */
ScalaJS.h.LChromi3wm$Root = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Root.prototype = ScalaJS.c.LChromi3wm$Root.prototype;
ScalaJS.c.LChromi3wm$Root.prototype.render__sjs_js_Dynamic__V = (function(d3selection) {
  var jsx$1 = d3selection["selectKids"]("li");
  var dict = this.workspaces$2;
  var this$3 = new ScalaJS.c.sjs_js_WrappedDictionary().init___sjs_js_Dictionary(dict);
  var this$5 = new ScalaJS.c.sc_MapLike$DefaultValuesIterable().init___sc_MapLike(this$3);
  var array = [];
  matchEnd4: {
    var this$6 = this$5.$$outer$f;
    var this$7 = new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$6);
    while (this$7.iter$2.hasNext__Z()) {
      var arg1 = this$7.next__O();
      array["push"](arg1)
    };
    break matchEnd4
  };
  var items = jsx$1["data"](array, (function(d$2) {
    return ScalaJS.m.LChromi3wm$().keyOf__sjs_js_Dynamic__sjs_js_Dynamic(d$2)
  }));
  items["exit"]()["remove"]();
  var added = items["enter"]()["append"]("li");
  added["append"]("div")["classed"]("title", true)["text"]((function(d$2$1) {
    return ScalaJS.m.LChromi3wm$().keyOf__sjs_js_Dynamic__sjs_js_Dynamic(d$2$1)
  }));
  added["append"]("svg");
  items["each"]((function(f) {
    return (function(arg1$1) {
      return f.apply__O__O__O(this, arg1$1)
    })
  })(new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(t$2, d$2$2) {
    return d$2$2["render"](t$2)
  }))))
});
ScalaJS.c.LChromi3wm$Root.prototype.$$js$exported$prop$outputs__O = (function() {
  return this.outputs$2
});
ScalaJS.c.LChromi3wm$Root.prototype.$$js$exported$prop$workspaces__O = (function() {
  return this.workspaces$2
});
ScalaJS.c.LChromi3wm$Root.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Root.prototype.toString__T = (function() {
  return ("Root#" + ScalaJS.uI(this.c$1["id"]))
});
ScalaJS.c.LChromi3wm$Root.prototype.init___LChromi3wm$Container = (function(c) {
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "root", "root", false);
  var array = this.c$1["nodes"];
  var array$1 = [];
  ScalaJS.uI(array["length"]);
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    var elem = new ScalaJS.c.LChromi3wm$Output().init___LChromi3wm$Container__LChromi3wm$Root(arg1, this);
    array$1["push"](elem);
    i = ((1 + i) | 0)
  };
  this.outputs$2 = array$1;
  this.workspaces$2 = ScalaJS.m.sjs_js_Dictionary$().empty__sjs_js_Dictionary();
  var array$2 = this.outputs$2;
  var f = new ScalaJS.c.LChromi3wm$Root$$anonfun$4().init___LChromi3wm$Root(this);
  var i$1 = 0;
  var len$1 = ScalaJS.uI(array$2["length"]);
  while ((i$1 < len$1)) {
    var index$1 = i$1;
    var v1 = array$2[index$1];
    f.apply__LChromi3wm$Output__V(ScalaJS.as.LChromi3wm$Output(v1));
    i$1 = ((1 + i$1) | 0)
  };
  return this
});
ScalaJS.c.LChromi3wm$Root.prototype.$$js$exported$meth$render__sjs_js_Dynamic__O = (function(d3selection) {
  this.render__sjs_js_Dynamic__V(d3selection)
});
ScalaJS.c.LChromi3wm$Root.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Root.prototype, "outputs", {
  "get": (function() {
    return this.$$js$exported$prop$outputs__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Root.prototype, "workspaces", {
  "get": (function() {
    return this.$$js$exported$prop$workspaces__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Root.prototype["render"] = (function(arg$1) {
  var preparg$1 = arg$1;
  return this.$$js$exported$meth$render__sjs_js_Dynamic__O(preparg$1)
});
ScalaJS.is.LChromi3wm$Root = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Root)))
});
ScalaJS.as.LChromi3wm$Root = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Root(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Root"))
});
ScalaJS.isArrayOf.LChromi3wm$Root = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Root)))
});
ScalaJS.asArrayOf.LChromi3wm$Root = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Root(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Root;", depth))
});
ScalaJS.d.LChromi3wm$Root = new ScalaJS.ClassTypeData({
  LChromi3wm$Root: 0
}, false, "Chromi3wm$Root", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Root: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Root.prototype.$classData = ScalaJS.d.LChromi3wm$Root;
/** @constructor */
ScalaJS.c.LChromi3wm$Tile = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.tiles$2 = null
});
ScalaJS.c.LChromi3wm$Tile.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Tile.prototype.constructor = ScalaJS.c.LChromi3wm$Tile;
/** @constructor */
ScalaJS.h.LChromi3wm$Tile = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Tile.prototype = ScalaJS.c.LChromi3wm$Tile.prototype;
ScalaJS.c.LChromi3wm$Tile.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Tile.prototype.toString__T = (function() {
  return ((((("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(this.parent$1, ".Tile#")) + ScalaJS.uI(this.c$1["id"])) + "'") + ScalaJS.as.T(this.c$1["name"])) + "'")
});
ScalaJS.c.LChromi3wm$Tile.prototype.$$js$exported$prop$tiles__O = (function() {
  return this.tiles$2
});
ScalaJS.c.LChromi3wm$Tile.prototype.init___LChromi3wm$Container = (function(c) {
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "con", null, false);
  var array = this.c$1["nodes"];
  var array$1 = [];
  ScalaJS.uI(array["length"]);
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    var elem = new ScalaJS.c.LChromi3wm$Tile().init___LChromi3wm$Container(arg1);
    array$1["push"](elem);
    i = ((1 + i) | 0)
  };
  this.tiles$2 = array$1;
  return this
});
ScalaJS.c.LChromi3wm$Tile.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Tile.prototype, "tiles", {
  "get": (function() {
    return this.$$js$exported$prop$tiles__O()
  }),
  "enumerable": true
});
ScalaJS.is.LChromi3wm$Tile = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Tile)))
});
ScalaJS.as.LChromi3wm$Tile = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Tile(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Tile"))
});
ScalaJS.isArrayOf.LChromi3wm$Tile = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Tile)))
});
ScalaJS.asArrayOf.LChromi3wm$Tile = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Tile(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Tile;", depth))
});
ScalaJS.d.LChromi3wm$Tile = new ScalaJS.ClassTypeData({
  LChromi3wm$Tile: 0
}, false, "Chromi3wm$Tile", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Tile: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Tile.prototype.$classData = ScalaJS.d.LChromi3wm$Tile;
/** @constructor */
ScalaJS.c.LChromi3wm$Workspace = (function() {
  ScalaJS.c.LChromi3wm$WrappedContainer.call(this);
  this.up$2 = null;
  this.key$2 = null;
  this.tiles$2 = null;
  this.flat$2 = null;
  this.xMarks$2 = null;
  this.yMarks$2 = null;
  this.xFunc$2 = null;
  this.yFunc$2 = null
});
ScalaJS.c.LChromi3wm$Workspace.prototype = new ScalaJS.h.LChromi3wm$WrappedContainer();
ScalaJS.c.LChromi3wm$Workspace.prototype.constructor = ScalaJS.c.LChromi3wm$Workspace;
/** @constructor */
ScalaJS.h.LChromi3wm$Workspace = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Workspace.prototype = ScalaJS.c.LChromi3wm$Workspace.prototype;
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$yMarks__O = (function() {
  return this.yMarks$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$meth$toString__O = (function() {
  return this.toString__T()
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$xFunc__O = (function() {
  return this.xFunc$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.toString__T = (function() {
  return ((((("" + ScalaJS.m.s_Predef$any2stringadd$().$$plus$extension__O__T__T(this.up$2, ".Workspace#")) + ScalaJS.uI(this.c$1["id"])) + "'") + ScalaJS.as.T(this.c$1["name"])) + "'")
});
ScalaJS.c.LChromi3wm$Workspace.prototype.render__sjs_js_Any__V = (function(liElement) {
  var svg = ScalaJS.g["d3"]["select"](liElement)["selectKids"]("svg");
  if ((!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(svg["size"](), 1))) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new ScalaJS.c.sjs_js_JavaScriptException().init___O((0, ScalaJS.g["Error"])("svg")))
  };
  var width = this.wIn__LChromi3wm$EdgeFunction__I(this.xFunc$2);
  var height = this.hIn__LChromi3wm$EdgeFunction__I(this.yFunc$2);
  var value = ((width / 4) | 0);
  var jsx$2 = svg["attr"]("width", value);
  var value$1 = ((height / 4) | 0);
  var jsx$1 = jsx$2["attr"]("height", value$1);
  var s = ((((((this.xIn__LChromi3wm$EdgeFunction__I(this.xFunc$2) + " ") + this.yIn__LChromi3wm$EdgeFunction__I(this.yFunc$2)) + " ") + width) + " ") + height);
  jsx$1["attr"]("viewBox", s);
  var rs = svg["selectKids"]("rect")["data"](this.flat$2, (function(w$2) {
    return w$2["c"]["id"]
  }));
  rs["exit"]()["remove"]();
  rs["enter"]()["append"]("rect")["append"]("title");
  rs["order"]()["each"]((function(f) {
    return (function(arg1) {
      return f.apply__O__O__O(this, arg1)
    })
  })(new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(arg$outer) {
    return (function(t$2, w$2$1) {
      var w = ScalaJS.as.LChromi3wm$WrappedContainer(w$2$1);
      var n = ScalaJS.g["d3"]["select"](t$2);
      var value$2 = w.xIn__LChromi3wm$EdgeFunction__I(arg$outer.xFunc$2);
      var jsx$13 = n["attr"]("x", value$2);
      var value$3 = w.yIn__LChromi3wm$EdgeFunction__I(arg$outer.yFunc$2);
      var jsx$12 = jsx$13["attr"]("y", value$3);
      var value$4 = w.wIn__LChromi3wm$EdgeFunction__I(arg$outer.xFunc$2);
      var jsx$11 = jsx$12["attr"]("width", value$4);
      var value$5 = w.hIn__LChromi3wm$EdgeFunction__I(arg$outer.yFunc$2);
      var jsx$10 = jsx$11["attr"]("height", value$5);
      var value$6 = ((w.c$1["window"] === null) && (ScalaJS.as.T(w.c$1["layout"]) === "splith"));
      var jsx$9 = jsx$10["classed"]("splith", value$6);
      var value$7 = ((w.c$1["window"] === null) && (ScalaJS.as.T(w.c$1["layout"]) === "splitv"));
      var jsx$8 = jsx$9["classed"]("splitv", value$7);
      var value$8 = ((w.c$1["window"] === null) && (ScalaJS.as.T(w.c$1["layout"]) === "stacked"));
      var jsx$7 = jsx$8["classed"]("stacked", value$8);
      var value$9 = ((w.c$1["window"] === null) && (ScalaJS.as.T(w.c$1["layout"]) === "tabbed"));
      var jsx$6 = jsx$7["classed"]("tabbed", value$9);
      var value$10 = (w.c$1["window"] !== null);
      var jsx$5 = jsx$6["classed"]("window", value$10);
      var jsx$4 = jsx$5["selectKids"]("title");
      if ((w.c$1["window"] === null)) {
        var s$1 = ScalaJS.as.T(w.c$1["layout"]);
        var jsx$3 = s$1
      } else {
        var s$2 = ScalaJS.as.T(w.c$1["name"]);
        var jsx$3 = s$2
      };
      return jsx$4["text"](jsx$3)
    })
  })(this))))
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$key__O = (function() {
  return this.key$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.init___LChromi3wm$Container__LChromi3wm$Content = (function(c, up) {
  this.up$2 = up;
  ScalaJS.c.LChromi3wm$WrappedContainer.prototype.init___LChromi3wm$Container.call(this, c);
  ScalaJS.m.LChromi3wm$().require__LChromi3wm$Container__T__T__Z__V(this.c$1, "workspace", null, true);
  this.key$2 = ((ScalaJS.as.T(up.up$2.c$1["name"]) + ".") + ScalaJS.as.T(this.c$1["name"]));
  var array = this.c$1["nodes"];
  var array$1 = [];
  ScalaJS.uI(array["length"]);
  var i = 0;
  var len = ScalaJS.uI(array["length"]);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    var elem = new ScalaJS.c.LChromi3wm$Tile().init___LChromi3wm$Container(arg1);
    array$1["push"](elem);
    i = ((1 + i) | 0)
  };
  this.tiles$2 = array$1;
  this.flat$2 = ScalaJS.g["d3"]["layout"]["hierarchy"]()["children"]((function(p$2) {
    return p$2["tiles"]
  }))["value"](null)["sort"](null)(this);
  this.xMarks$2 = new ScalaJS.c.LChromi3wm$EdgeMarker().init___();
  this.yMarks$2 = new ScalaJS.c.LChromi3wm$EdgeMarker().init___();
  var array$2 = this.flat$2;
  var i$1 = 0;
  var len$1 = ScalaJS.uI(array$2["length"]);
  while ((i$1 < len$1)) {
    var index$1 = i$1;
    var arg1$1 = array$2[index$1];
    var w = ScalaJS.as.LChromi3wm$WrappedContainer(arg1$1);
    w.mark__LChromi3wm$EdgeMarker__LChromi3wm$EdgeMarker__V(this.xMarks$2, this.yMarks$2);
    i$1 = ((1 + i$1) | 0)
  };
  this.xFunc$2 = new ScalaJS.c.LChromi3wm$EdgeFunction().init___sjs_js_Array(this.xMarks$2.compute__sjs_js_Array());
  this.yFunc$2 = new ScalaJS.c.LChromi3wm$EdgeFunction().init___sjs_js_Array(this.yMarks$2.compute__sjs_js_Array());
  return this
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$tiles__O = (function() {
  return this.tiles$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$xMarks__O = (function() {
  return this.xMarks$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$up__O = (function() {
  return this.up$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$flat__O = (function() {
  return this.flat$2
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$meth$render__sjs_js_Any__O = (function(liElement) {
  this.render__sjs_js_Any__V(liElement)
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$$js$exported$prop$yFunc__O = (function() {
  return this.yFunc$2
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "up", {
  "get": (function() {
    return this.$$js$exported$prop$up__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Workspace.prototype["toString"] = (function() {
  return this.$$js$exported$meth$toString__O()
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "key", {
  "get": (function() {
    return this.$$js$exported$prop$key__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "tiles", {
  "get": (function() {
    return this.$$js$exported$prop$tiles__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "flat", {
  "get": (function() {
    return this.$$js$exported$prop$flat__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "xMarks", {
  "get": (function() {
    return this.$$js$exported$prop$xMarks__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "yMarks", {
  "get": (function() {
    return this.$$js$exported$prop$yMarks__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "xFunc", {
  "get": (function() {
    return this.$$js$exported$prop$xFunc__O()
  }),
  "enumerable": true
});
Object["defineProperty"](ScalaJS.c.LChromi3wm$Workspace.prototype, "yFunc", {
  "get": (function() {
    return this.$$js$exported$prop$yFunc__O()
  }),
  "enumerable": true
});
ScalaJS.c.LChromi3wm$Workspace.prototype["render"] = (function(arg$1) {
  var preparg$1 = arg$1;
  return this.$$js$exported$meth$render__sjs_js_Any__O(preparg$1)
});
ScalaJS.is.LChromi3wm$Workspace = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Workspace)))
});
ScalaJS.as.LChromi3wm$Workspace = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Workspace(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Workspace"))
});
ScalaJS.isArrayOf.LChromi3wm$Workspace = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Workspace)))
});
ScalaJS.asArrayOf.LChromi3wm$Workspace = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Workspace(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Workspace;", depth))
});
ScalaJS.d.LChromi3wm$Workspace = new ScalaJS.ClassTypeData({
  LChromi3wm$Workspace: 0
}, false, "Chromi3wm$Workspace", ScalaJS.d.LChromi3wm$WrappedContainer, {
  LChromi3wm$Workspace: 1,
  LChromi3wm$WrappedContainer: 1,
  O: 1
});
ScalaJS.c.LChromi3wm$Workspace.prototype.$classData = ScalaJS.d.LChromi3wm$Workspace;
ScalaJS.isArrayOf.jl_Boolean = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Boolean)))
});
ScalaJS.asArrayOf.jl_Boolean = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Boolean(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Boolean;", depth))
});
ScalaJS.d.jl_Boolean = new ScalaJS.ClassTypeData({
  jl_Boolean: 0
}, false, "java.lang.Boolean", ScalaJS.d.O, {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
ScalaJS.c.jl_Character = (function() {
  ScalaJS.c.O.call(this);
  this.value$1 = 0
});
ScalaJS.c.jl_Character.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Character.prototype.constructor = ScalaJS.c.jl_Character;
/** @constructor */
ScalaJS.h.jl_Character = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Character.prototype = ScalaJS.c.jl_Character.prototype;
ScalaJS.c.jl_Character.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = ScalaJS.as.jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
ScalaJS.c.jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))
});
ScalaJS.c.jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
ScalaJS.c.jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
ScalaJS.is.jl_Character = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
});
ScalaJS.as.jl_Character = (function(obj) {
  return ((ScalaJS.is.jl_Character(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Character"))
});
ScalaJS.isArrayOf.jl_Character = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
});
ScalaJS.asArrayOf.jl_Character = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Character(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Character;", depth))
});
ScalaJS.d.jl_Character = new ScalaJS.ClassTypeData({
  jl_Character: 0
}, false, "java.lang.Character", ScalaJS.d.O, {
  jl_Character: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.jl_Character.prototype.$classData = ScalaJS.d.jl_Character;
/** @constructor */
ScalaJS.c.jl_InheritableThreadLocal = (function() {
  ScalaJS.c.jl_ThreadLocal.call(this)
});
ScalaJS.c.jl_InheritableThreadLocal.prototype = new ScalaJS.h.jl_ThreadLocal();
ScalaJS.c.jl_InheritableThreadLocal.prototype.constructor = ScalaJS.c.jl_InheritableThreadLocal;
/** @constructor */
ScalaJS.h.jl_InheritableThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_InheritableThreadLocal.prototype = ScalaJS.c.jl_InheritableThreadLocal.prototype;
ScalaJS.is.jl_InheritableThreadLocal = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_InheritableThreadLocal)))
});
ScalaJS.as.jl_InheritableThreadLocal = (function(obj) {
  return ((ScalaJS.is.jl_InheritableThreadLocal(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.InheritableThreadLocal"))
});
ScalaJS.isArrayOf.jl_InheritableThreadLocal = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_InheritableThreadLocal)))
});
ScalaJS.asArrayOf.jl_InheritableThreadLocal = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_InheritableThreadLocal(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.InheritableThreadLocal;", depth))
});
ScalaJS.d.jl_InheritableThreadLocal = new ScalaJS.ClassTypeData({
  jl_InheritableThreadLocal: 0
}, false, "java.lang.InheritableThreadLocal", ScalaJS.d.jl_ThreadLocal, {
  jl_InheritableThreadLocal: 1,
  jl_ThreadLocal: 1,
  O: 1
});
ScalaJS.c.jl_InheritableThreadLocal.prototype.$classData = ScalaJS.d.jl_InheritableThreadLocal;
/** @constructor */
ScalaJS.c.jl_Throwable = (function() {
  ScalaJS.c.O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
});
ScalaJS.c.jl_Throwable.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Throwable.prototype.constructor = ScalaJS.c.jl_Throwable;
/** @constructor */
ScalaJS.h.jl_Throwable = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Throwable.prototype = ScalaJS.c.jl_Throwable.prototype;
ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var this$1 = ScalaJS.m.sjsr_StackTrace$();
  this$1.captureState__jl_Throwable__O__V(this, this$1.createException__p1__O());
  return this
});
ScalaJS.c.jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
ScalaJS.c.jl_Throwable.prototype.toString__T = (function() {
  var className = ScalaJS.objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
ScalaJS.c.jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
ScalaJS.is.jl_Throwable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
});
ScalaJS.as.jl_Throwable = (function(obj) {
  return ((ScalaJS.is.jl_Throwable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Throwable"))
});
ScalaJS.isArrayOf.jl_Throwable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
});
ScalaJS.asArrayOf.jl_Throwable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Throwable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
});
ScalaJS.d.jl_Throwable = new ScalaJS.ClassTypeData({
  jl_Throwable: 0
}, false, "java.lang.Throwable", ScalaJS.d.O, {
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_Throwable.prototype.$classData = ScalaJS.d.jl_Throwable;
ScalaJS.is.s_math_ScalaNumber = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
});
ScalaJS.as.s_math_ScalaNumber = (function(obj) {
  return ((ScalaJS.is.s_math_ScalaNumber(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.math.ScalaNumber"))
});
ScalaJS.isArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
});
ScalaJS.asArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
});
ScalaJS.d.s_math_ScalaNumber = new ScalaJS.ClassTypeData({
  s_math_ScalaNumber: 0
}, false, "scala.math.ScalaNumber", ScalaJS.d.jl_Number, {
  s_math_ScalaNumber: 1,
  jl_Number: 1,
  O: 1
});
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3$ = (function() {
  ScalaJS.c.s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype = new ScalaJS.h.s_util_hashing_MurmurHash3();
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3$;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3$.prototype = ScalaJS.c.s_util_hashing_MurmurHash3$.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  ScalaJS.n.s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if (ScalaJS.is.sci_List(xs)) {
    var x2 = ScalaJS.as.sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
ScalaJS.is.s_util_hashing_MurmurHash3$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_hashing_MurmurHash3$)))
});
ScalaJS.as.s_util_hashing_MurmurHash3$ = (function(obj) {
  return ((ScalaJS.is.s_util_hashing_MurmurHash3$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.hashing.MurmurHash3$"))
});
ScalaJS.isArrayOf.s_util_hashing_MurmurHash3$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_hashing_MurmurHash3$)))
});
ScalaJS.asArrayOf.s_util_hashing_MurmurHash3$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_hashing_MurmurHash3$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.hashing.MurmurHash3$;", depth))
});
ScalaJS.d.s_util_hashing_MurmurHash3$ = new ScalaJS.ClassTypeData({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", ScalaJS.d.s_util_hashing_MurmurHash3, {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.$classData = ScalaJS.d.s_util_hashing_MurmurHash3$;
ScalaJS.n.s_util_hashing_MurmurHash3$ = (void 0);
ScalaJS.m.s_util_hashing_MurmurHash3$ = (function() {
  if ((!ScalaJS.n.s_util_hashing_MurmurHash3$)) {
    ScalaJS.n.s_util_hashing_MurmurHash3$ = new ScalaJS.c.s_util_hashing_MurmurHash3$().init___()
  };
  return ScalaJS.n.s_util_hashing_MurmurHash3$
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction1.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction1.prototype.constructor = ScalaJS.c.sr_AbstractFunction1;
/** @constructor */
ScalaJS.h.sr_AbstractFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction1.prototype = ScalaJS.c.sr_AbstractFunction1.prototype;
ScalaJS.c.sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
ScalaJS.is.sr_AbstractFunction1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_AbstractFunction1)))
});
ScalaJS.as.sr_AbstractFunction1 = (function(obj) {
  return ((ScalaJS.is.sr_AbstractFunction1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.AbstractFunction1"))
});
ScalaJS.isArrayOf.sr_AbstractFunction1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_AbstractFunction1)))
});
ScalaJS.asArrayOf.sr_AbstractFunction1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_AbstractFunction1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.AbstractFunction1;", depth))
});
ScalaJS.d.sr_AbstractFunction1 = new ScalaJS.ClassTypeData({
  sr_AbstractFunction1: 0
}, false, "scala.runtime.AbstractFunction1", ScalaJS.d.O, {
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sr_AbstractFunction1.prototype.$classData = ScalaJS.d.sr_AbstractFunction1;
/** @constructor */
ScalaJS.c.sr_AbstractFunction2 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction2.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction2.prototype.constructor = ScalaJS.c.sr_AbstractFunction2;
/** @constructor */
ScalaJS.h.sr_AbstractFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction2.prototype = ScalaJS.c.sr_AbstractFunction2.prototype;
ScalaJS.c.sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
ScalaJS.is.sr_AbstractFunction2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_AbstractFunction2)))
});
ScalaJS.as.sr_AbstractFunction2 = (function(obj) {
  return ((ScalaJS.is.sr_AbstractFunction2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.AbstractFunction2"))
});
ScalaJS.isArrayOf.sr_AbstractFunction2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_AbstractFunction2)))
});
ScalaJS.asArrayOf.sr_AbstractFunction2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_AbstractFunction2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.AbstractFunction2;", depth))
});
ScalaJS.d.sr_AbstractFunction2 = new ScalaJS.ClassTypeData({
  sr_AbstractFunction2: 0
}, false, "scala.runtime.AbstractFunction2", ScalaJS.d.O, {
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
ScalaJS.c.sr_AbstractFunction2.prototype.$classData = ScalaJS.d.sr_AbstractFunction2;
/** @constructor */
ScalaJS.c.sr_BooleanRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = false
});
ScalaJS.c.sr_BooleanRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BooleanRef.prototype.constructor = ScalaJS.c.sr_BooleanRef;
/** @constructor */
ScalaJS.h.sr_BooleanRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BooleanRef.prototype = ScalaJS.c.sr_BooleanRef.prototype;
ScalaJS.c.sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.is.sr_BooleanRef = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_BooleanRef)))
});
ScalaJS.as.sr_BooleanRef = (function(obj) {
  return ((ScalaJS.is.sr_BooleanRef(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.BooleanRef"))
});
ScalaJS.isArrayOf.sr_BooleanRef = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BooleanRef)))
});
ScalaJS.asArrayOf.sr_BooleanRef = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_BooleanRef(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.BooleanRef;", depth))
});
ScalaJS.d.sr_BooleanRef = new ScalaJS.ClassTypeData({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", ScalaJS.d.O, {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_BooleanRef.prototype.$classData = ScalaJS.d.sr_BooleanRef;
/** @constructor */
ScalaJS.c.sr_IntRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = 0
});
ScalaJS.c.sr_IntRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_IntRef.prototype.constructor = ScalaJS.c.sr_IntRef;
/** @constructor */
ScalaJS.h.sr_IntRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_IntRef.prototype = ScalaJS.c.sr_IntRef.prototype;
ScalaJS.c.sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.is.sr_IntRef = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_IntRef)))
});
ScalaJS.as.sr_IntRef = (function(obj) {
  return ((ScalaJS.is.sr_IntRef(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.IntRef"))
});
ScalaJS.isArrayOf.sr_IntRef = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_IntRef)))
});
ScalaJS.asArrayOf.sr_IntRef = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_IntRef(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.IntRef;", depth))
});
ScalaJS.d.sr_IntRef = new ScalaJS.ClassTypeData({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", ScalaJS.d.O, {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_IntRef.prototype.$classData = ScalaJS.d.sr_IntRef;
/** @constructor */
ScalaJS.c.Ljava_io_OutputStream = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Ljava_io_OutputStream.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljava_io_OutputStream.prototype.constructor = ScalaJS.c.Ljava_io_OutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_OutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_OutputStream.prototype = ScalaJS.c.Ljava_io_OutputStream.prototype;
ScalaJS.is.Ljava_io_OutputStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_OutputStream)))
});
ScalaJS.as.Ljava_io_OutputStream = (function(obj) {
  return ((ScalaJS.is.Ljava_io_OutputStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.io.OutputStream"))
});
ScalaJS.isArrayOf.Ljava_io_OutputStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_OutputStream)))
});
ScalaJS.asArrayOf.Ljava_io_OutputStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljava_io_OutputStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.io.OutputStream;", depth))
});
ScalaJS.d.Ljava_io_OutputStream = new ScalaJS.ClassTypeData({
  Ljava_io_OutputStream: 0
}, false, "java.io.OutputStream", ScalaJS.d.O, {
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
ScalaJS.c.Ljava_io_OutputStream.prototype.$classData = ScalaJS.d.Ljava_io_OutputStream;
ScalaJS.isArrayOf.jl_Byte = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Byte)))
});
ScalaJS.asArrayOf.jl_Byte = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Byte(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Byte;", depth))
});
ScalaJS.d.jl_Byte = new ScalaJS.ClassTypeData({
  jl_Byte: 0
}, false, "java.lang.Byte", ScalaJS.d.jl_Number, {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ScalaJS.isByte(x)
}));
ScalaJS.isArrayOf.jl_Double = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
});
ScalaJS.asArrayOf.jl_Double = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Double(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Double;", depth))
});
ScalaJS.d.jl_Double = new ScalaJS.ClassTypeData({
  jl_Double: 0
}, false, "java.lang.Double", ScalaJS.d.jl_Number, {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
ScalaJS.c.jl_Error = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Error.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Error.prototype.constructor = ScalaJS.c.jl_Error;
/** @constructor */
ScalaJS.h.jl_Error = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Error.prototype = ScalaJS.c.jl_Error.prototype;
ScalaJS.is.jl_Error = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Error)))
});
ScalaJS.as.jl_Error = (function(obj) {
  return ((ScalaJS.is.jl_Error(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Error"))
});
ScalaJS.isArrayOf.jl_Error = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Error)))
});
ScalaJS.asArrayOf.jl_Error = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Error(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Error;", depth))
});
ScalaJS.d.jl_Error = new ScalaJS.ClassTypeData({
  jl_Error: 0
}, false, "java.lang.Error", ScalaJS.d.jl_Throwable, {
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_Error.prototype.$classData = ScalaJS.d.jl_Error;
/** @constructor */
ScalaJS.c.jl_Exception = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Exception.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Exception.prototype.constructor = ScalaJS.c.jl_Exception;
/** @constructor */
ScalaJS.h.jl_Exception = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Exception.prototype = ScalaJS.c.jl_Exception.prototype;
ScalaJS.is.jl_Exception = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Exception)))
});
ScalaJS.as.jl_Exception = (function(obj) {
  return ((ScalaJS.is.jl_Exception(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Exception"))
});
ScalaJS.isArrayOf.jl_Exception = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Exception)))
});
ScalaJS.asArrayOf.jl_Exception = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Exception(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Exception;", depth))
});
ScalaJS.d.jl_Exception = new ScalaJS.ClassTypeData({
  jl_Exception: 0
}, false, "java.lang.Exception", ScalaJS.d.jl_Throwable, {
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_Exception.prototype.$classData = ScalaJS.d.jl_Exception;
ScalaJS.isArrayOf.jl_Float = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Float)))
});
ScalaJS.asArrayOf.jl_Float = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Float(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Float;", depth))
});
ScalaJS.d.jl_Float = new ScalaJS.ClassTypeData({
  jl_Float: 0
}, false, "java.lang.Float", ScalaJS.d.jl_Number, {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ScalaJS.isFloat(x)
}));
ScalaJS.isArrayOf.jl_Integer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
});
ScalaJS.asArrayOf.jl_Integer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Integer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
});
ScalaJS.d.jl_Integer = new ScalaJS.ClassTypeData({
  jl_Integer: 0
}, false, "java.lang.Integer", ScalaJS.d.jl_Number, {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ScalaJS.isInt(x)
}));
ScalaJS.isArrayOf.jl_Long = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
});
ScalaJS.asArrayOf.jl_Long = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Long(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Long;", depth))
});
ScalaJS.d.jl_Long = new ScalaJS.ClassTypeData({
  jl_Long: 0
}, false, "java.lang.Long", ScalaJS.d.jl_Number, {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ScalaJS.is.sjsr_RuntimeLong(x)
}));
ScalaJS.isArrayOf.jl_Short = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Short)))
});
ScalaJS.asArrayOf.jl_Short = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Short(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Short;", depth))
});
ScalaJS.d.jl_Short = new ScalaJS.ClassTypeData({
  jl_Short: 0
}, false, "java.lang.Short", ScalaJS.d.jl_Number, {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (function(x) {
  return ScalaJS.isShort(x)
}));
/** @constructor */
ScalaJS.c.s_Console$ = (function() {
  ScalaJS.c.s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
});
ScalaJS.c.s_Console$.prototype = new ScalaJS.h.s_DeprecatedConsole();
ScalaJS.c.s_Console$.prototype.constructor = ScalaJS.c.s_Console$;
/** @constructor */
ScalaJS.h.s_Console$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Console$.prototype = ScalaJS.c.s_Console$.prototype;
ScalaJS.c.s_Console$.prototype.init___ = (function() {
  ScalaJS.n.s_Console$ = this;
  this.outVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().out$1);
  this.errVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().err$1);
  this.inVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(null);
  return this
});
ScalaJS.is.s_Console$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Console$)))
});
ScalaJS.as.s_Console$ = (function(obj) {
  return ((ScalaJS.is.s_Console$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Console$"))
});
ScalaJS.isArrayOf.s_Console$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Console$)))
});
ScalaJS.asArrayOf.s_Console$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_Console$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Console$;", depth))
});
ScalaJS.d.s_Console$ = new ScalaJS.ClassTypeData({
  s_Console$: 0
}, false, "scala.Console$", ScalaJS.d.s_DeprecatedConsole, {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
ScalaJS.c.s_Console$.prototype.$classData = ScalaJS.d.s_Console$;
ScalaJS.n.s_Console$ = (void 0);
ScalaJS.m.s_Console$ = (function() {
  if ((!ScalaJS.n.s_Console$)) {
    ScalaJS.n.s_Console$ = new ScalaJS.c.s_Console$().init___()
  };
  return ScalaJS.n.s_Console$
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable$$anon$1 = (function() {
  ScalaJS.c.jl_InheritableThreadLocal.call(this);
  this.$$outer$3 = null
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype = new ScalaJS.h.jl_InheritableThreadLocal();
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.constructor = ScalaJS.c.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable$$anon$1.prototype = ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype;
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.init___s_util_DynamicVariable = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$3 = $$outer
  };
  ScalaJS.c.jl_InheritableThreadLocal.prototype.init___.call(this);
  return this
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.initialValue__O = (function() {
  return this.$$outer$3.scala$util$DynamicVariable$$init$f
});
ScalaJS.is.s_util_DynamicVariable$$anon$1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_DynamicVariable$$anon$1)))
});
ScalaJS.as.s_util_DynamicVariable$$anon$1 = (function(obj) {
  return ((ScalaJS.is.s_util_DynamicVariable$$anon$1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.DynamicVariable$$anon$1"))
});
ScalaJS.isArrayOf.s_util_DynamicVariable$$anon$1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_DynamicVariable$$anon$1)))
});
ScalaJS.asArrayOf.s_util_DynamicVariable$$anon$1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_DynamicVariable$$anon$1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.DynamicVariable$$anon$1;", depth))
});
ScalaJS.d.s_util_DynamicVariable$$anon$1 = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable$$anon$1: 0
}, false, "scala.util.DynamicVariable$$anon$1", ScalaJS.d.jl_InheritableThreadLocal, {
  s_util_DynamicVariable$$anon$1: 1,
  jl_InheritableThreadLocal: 1,
  jl_ThreadLocal: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.$classData = ScalaJS.d.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction1 = (function() {
  ScalaJS.c.sr_AbstractFunction1.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction1.prototype = new ScalaJS.h.sr_AbstractFunction1();
ScalaJS.c.sjsr_AnonFunction1.prototype.constructor = ScalaJS.c.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction1.prototype = ScalaJS.c.sjsr_AnonFunction1.prototype;
ScalaJS.c.sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
ScalaJS.c.sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.is.sjsr_AnonFunction1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_AnonFunction1)))
});
ScalaJS.as.sjsr_AnonFunction1 = (function(obj) {
  return ((ScalaJS.is.sjsr_AnonFunction1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.AnonFunction1"))
});
ScalaJS.isArrayOf.sjsr_AnonFunction1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_AnonFunction1)))
});
ScalaJS.asArrayOf.sjsr_AnonFunction1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_AnonFunction1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.AnonFunction1;", depth))
});
ScalaJS.d.sjsr_AnonFunction1 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", ScalaJS.d.sr_AbstractFunction1, {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sjsr_AnonFunction1.prototype.$classData = ScalaJS.d.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction2 = (function() {
  ScalaJS.c.sr_AbstractFunction2.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction2.prototype = new ScalaJS.h.sr_AbstractFunction2();
ScalaJS.c.sjsr_AnonFunction2.prototype.constructor = ScalaJS.c.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction2.prototype = ScalaJS.c.sjsr_AnonFunction2.prototype;
ScalaJS.c.sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.c.sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
ScalaJS.is.sjsr_AnonFunction2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_AnonFunction2)))
});
ScalaJS.as.sjsr_AnonFunction2 = (function(obj) {
  return ((ScalaJS.is.sjsr_AnonFunction2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.AnonFunction2"))
});
ScalaJS.isArrayOf.sjsr_AnonFunction2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_AnonFunction2)))
});
ScalaJS.asArrayOf.sjsr_AnonFunction2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_AnonFunction2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.AnonFunction2;", depth))
});
ScalaJS.d.sjsr_AnonFunction2 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", ScalaJS.d.sr_AbstractFunction2, {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
ScalaJS.c.sjsr_AnonFunction2.prototype.$classData = ScalaJS.d.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong = (function() {
  ScalaJS.c.jl_Number.call(this);
  this.l$2 = 0;
  this.m$2 = 0;
  this.h$2 = 0
});
ScalaJS.c.sjsr_RuntimeLong.prototype = new ScalaJS.h.jl_Number();
ScalaJS.c.sjsr_RuntimeLong.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong.prototype = ScalaJS.c.sjsr_RuntimeLong.prototype;
ScalaJS.c.sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return ScalaJS.uJ(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.powerOfTwo__p2__I = (function() {
  return (((((this.h$2 === 0) && (this.m$2 === 0)) && (this.l$2 !== 0)) && ((this.l$2 & (((-1) + this.l$2) | 0)) === 0)) ? ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.l$2) : (((((this.h$2 === 0) && (this.m$2 !== 0)) && (this.l$2 === 0)) && ((this.m$2 & (((-1) + this.m$2) | 0)) === 0)) ? ((22 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.m$2)) | 0) : (((((this.h$2 !== 0) && (this.m$2 === 0)) && (this.l$2 === 0)) && ((this.h$2 & (((-1) + this.h$2) | 0)) === 0)) ? ((44 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.h$2)) | 0) : (-1))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | y.l$2), (this.m$2 | y.m$2), (this.h$2 | y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 >= y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 < y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.toInt__I() << 16) >> 16)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.sjsr_RuntimeLong(that)) {
    var x2 = ScalaJS.as.sjsr_RuntimeLong(that);
    return this.equals__sjsr_RuntimeLong__Z(x2)
  } else {
    return false
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var _1 = (8191 & this.l$2);
  var _2 = ((this.l$2 >> 13) | ((15 & this.m$2) << 9));
  var _3 = (8191 & (this.m$2 >> 4));
  var _4 = ((this.m$2 >> 17) | ((255 & this.h$2) << 5));
  var _5 = ((1048320 & this.h$2) >> 8);
  matchEnd3: {
    var x$1;
    var x$1_$_$$und1$1 = _1;
    var x$1_$_$$und2$1 = _2;
    var x$1_$_$$und3$1 = _3;
    var x$1_$_$$und4$1 = _4;
    var x$1_$_$$und5$1 = _5;
    break matchEnd3
  };
  var a0$2 = ScalaJS.uI(x$1_$_$$und1$1);
  var a1$2 = ScalaJS.uI(x$1_$_$$und2$1);
  var a2$2 = ScalaJS.uI(x$1_$_$$und3$1);
  var a3$2 = ScalaJS.uI(x$1_$_$$und4$1);
  var a4$2 = ScalaJS.uI(x$1_$_$$und5$1);
  var _1$1 = (8191 & y.l$2);
  var _2$1 = ((y.l$2 >> 13) | ((15 & y.m$2) << 9));
  var _3$1 = (8191 & (y.m$2 >> 4));
  var _4$1 = ((y.m$2 >> 17) | ((255 & y.h$2) << 5));
  var _5$1 = ((1048320 & y.h$2) >> 8);
  matchEnd3$2: {
    var x$2;
    var x$2_$_$$und1$1 = _1$1;
    var x$2_$_$$und2$1 = _2$1;
    var x$2_$_$$und3$1 = _3$1;
    var x$2_$_$$und4$1 = _4$1;
    var x$2_$_$$und5$1 = _5$1;
    break matchEnd3$2
  };
  var b0$2 = ScalaJS.uI(x$2_$_$$und1$1);
  var b1$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var b2$2 = ScalaJS.uI(x$2_$_$$und3$1);
  var b3$2 = ScalaJS.uI(x$2_$_$$und4$1);
  var b4$2 = ScalaJS.uI(x$2_$_$$und5$1);
  var p0 = ScalaJS.imul(a0$2, b0$2);
  var p1 = ScalaJS.imul(a1$2, b0$2);
  var p2 = ScalaJS.imul(a2$2, b0$2);
  var p3 = ScalaJS.imul(a3$2, b0$2);
  var p4 = ScalaJS.imul(a4$2, b0$2);
  if ((b1$2 !== 0)) {
    p1 = ((p1 + ScalaJS.imul(a0$2, b1$2)) | 0);
    p2 = ((p2 + ScalaJS.imul(a1$2, b1$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a2$2, b1$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a3$2, b1$2)) | 0)
  };
  if ((b2$2 !== 0)) {
    p2 = ((p2 + ScalaJS.imul(a0$2, b2$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a1$2, b2$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a2$2, b2$2)) | 0)
  };
  if ((b3$2 !== 0)) {
    p3 = ((p3 + ScalaJS.imul(a0$2, b3$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a1$2, b3$2)) | 0)
  };
  if ((b4$2 !== 0)) {
    p4 = ((p4 + ScalaJS.imul(a0$2, b4$2)) | 0)
  };
  var c00 = (4194303 & p0);
  var c01 = ((511 & p1) << 13);
  var c0 = ((c00 + c01) | 0);
  var c10 = (p0 >> 22);
  var c11 = (p1 >> 9);
  var c12 = ((262143 & p2) << 4);
  var c13 = ((31 & p3) << 17);
  var c1 = ((((((c10 + c11) | 0) + c12) | 0) + c13) | 0);
  var c22 = (p2 >> 18);
  var c23 = (p3 >> 5);
  var c24 = ((4095 & p4) << 8);
  var c2 = ((((c22 + c23) | 0) + c24) | 0);
  var c1n = ((c1 + (c0 >> 22)) | 0);
  var h = ((c2 + (c1n >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & c0), (4194303 & c1n), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  this.l$2 = l;
  this.m$2 = m;
  this.h$2 = h;
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[1])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toString__T = (function() {
  if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return "0"
  } else if (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return "-9223372036854775808"
  } else if (((524288 & this.h$2) !== 0)) {
    return ("-" + this.unary$und$minus__sjsr_RuntimeLong().toString__T())
  } else {
    var tenPow9 = ScalaJS.m.sjsr_RuntimeLong$().TenPow9$1;
    var v = this;
    var acc = "";
    _toString0: while (true) {
      var this$1 = v;
      if ((((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))) {
        return acc
      } else {
        var quotRem = v.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(tenPow9);
        var quot = ScalaJS.as.sjsr_RuntimeLong(quotRem[0]);
        var rem = ScalaJS.as.sjsr_RuntimeLong(quotRem[1]);
        var this$2 = rem.toInt__I();
        var digits = ("" + this$2);
        if ((((quot.l$2 === 0) && (quot.m$2 === 0)) && (quot.h$2 === 0))) {
          var zeroPrefix = ""
        } else {
          var beginIndex = ScalaJS.uI(digits["length"]);
          var zeroPrefix = ScalaJS.as.T("000000000"["substring"](beginIndex))
        };
        var temp$acc = ((zeroPrefix + digits) + acc);
        v = quot;
        acc = temp$acc;
        continue _toString0
      }
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater$eq__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = ScalaJS.as.sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong = (function(bit) {
  return ((bit < 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | (1 << bit)), this.m$2, this.h$2) : ((bit < 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, (this.m$2 | (1 << (((-22) + bit) | 0))), this.h$2) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, this.m$2, (this.h$2 | (1 << (((-44) + bit) | 0))))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array = (function(y) {
  if ((((y.l$2 === 0) && (y.m$2 === 0)) && (y.h$2 === 0))) {
    throw new ScalaJS.c.jl_ArithmeticException().init___T("/ by zero")
  } else if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
  } else if (y.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? [ScalaJS.m.sjsr_RuntimeLong$().One$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1] : [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this])
  } else {
    var xNegative = ((524288 & this.h$2) !== 0);
    var yNegative = ((524288 & y.h$2) !== 0);
    var xMinValue = this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1);
    var pow = y.powerOfTwo__p2__I();
    if ((pow >= 0)) {
      if (xMinValue) {
        var z = this.$$greater$greater__I__sjsr_RuntimeLong(pow);
        return [(yNegative ? z.unary$und$minus__sjsr_RuntimeLong() : z), ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
      } else {
        var absX = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        var absZ = absX.$$greater$greater__I__sjsr_RuntimeLong(pow);
        var z$2 = ((xNegative !== yNegative) ? absZ.unary$und$minus__sjsr_RuntimeLong() : absZ);
        var remAbs = ((pow <= 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((absX.l$2 & (((-1) + (1 << pow)) | 0)), 0, 0) : ((pow <= 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, (absX.m$2 & (((-1) + (1 << (((-22) + pow) | 0))) | 0)), 0) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, absX.m$2, (absX.h$2 & (((-1) + (1 << (((-44) + pow) | 0))) | 0)))));
        var rem = (xNegative ? remAbs.unary$und$minus__sjsr_RuntimeLong() : remAbs);
        return [z$2, rem]
      }
    } else {
      var absY = (((524288 & y.h$2) !== 0) ? y.unary$und$minus__sjsr_RuntimeLong() : y);
      if (xMinValue) {
        var newX = ScalaJS.m.sjsr_RuntimeLong$().MaxValue$1
      } else {
        var absX$2 = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        if (absY.$$greater__sjsr_RuntimeLong__Z(absX$2)) {
          var newX;
          return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this]
        } else {
          var newX = absX$2
        }
      };
      var shift = ((absY.numberOfLeadingZeros__I() - newX.numberOfLeadingZeros__I()) | 0);
      var yShift = absY.$$less$less__I__sjsr_RuntimeLong(shift);
      var shift$1 = shift;
      var yShift$1 = yShift;
      var curX = newX;
      var quot = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
      x: {
        var x1;
        _divide0: while (true) {
          if ((shift$1 < 0)) {
            var jsx$1 = true
          } else {
            var this$1 = curX;
            var jsx$1 = (((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))
          };
          if (jsx$1) {
            var _1 = quot;
            var _2 = curX;
            var x1_$_$$und1$f = _1;
            var x1_$_$$und2$f = _2;
            break x
          } else {
            var this$2 = curX;
            var y$1 = yShift$1;
            var newX$1 = this$2.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$1.unary$und$minus__sjsr_RuntimeLong());
            if (((524288 & newX$1.h$2) === 0)) {
              var temp$shift = (((-1) + shift$1) | 0);
              var temp$yShift = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              var temp$quot = quot.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong(shift$1);
              shift$1 = temp$shift;
              yShift$1 = temp$yShift;
              curX = newX$1;
              quot = temp$quot;
              continue _divide0
            } else {
              var temp$shift$2 = (((-1) + shift$1) | 0);
              var temp$yShift$2 = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              shift$1 = temp$shift$2;
              yShift$1 = temp$yShift$2;
              continue _divide0
            }
          }
        }
      };
      var absQuot = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und1$f);
      var absRem = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und2$f);
      var x$3_$_$$und1$f = absQuot;
      var x$3_$_$$und2$f = absRem;
      var absQuot$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und1$f);
      var absRem$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und2$f);
      var quot$1 = ((xNegative !== yNegative) ? absQuot$2.unary$und$minus__sjsr_RuntimeLong() : absQuot$2);
      if ((xNegative && xMinValue)) {
        var this$3 = absRem$2.unary$und$minus__sjsr_RuntimeLong();
        var y$2 = ScalaJS.m.sjsr_RuntimeLong$().One$1;
        var rem$1 = this$3.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$2.unary$und$minus__sjsr_RuntimeLong())
      } else {
        var rem$1 = (xNegative ? absRem$2.unary$und$minus__sjsr_RuntimeLong() : absRem$2)
      };
      return [quot$1, rem$1]
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 & y.l$2), (this.m$2 & y.m$2), (this.h$2 & y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (this.h$2 << remBits));
    var h = ((this.h$2 >>> n) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (this.h$2 << remBits$2));
    var m$1 = ((this.h$2 >>> shfBits) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), 0)
  } else {
    var l$2 = ((this.h$2 >>> (((-44) + n) | 0)) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), 0, 0)
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(that) {
  return (this.equals__sjsr_RuntimeLong__Z(that) ? 0 : (this.$$greater__sjsr_RuntimeLong__Z(that) ? 1 : (-1)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 > y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 <= y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = (this.l$2 << n);
    var m = ((this.m$2 << n) | (this.l$2 >> remBits));
    var h = ((this.h$2 << n) | (this.m$2 >> remBits));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var m$1 = (this.l$2 << shfBits);
    var h$1 = ((this.m$2 << shfBits) | (this.l$2 >> remBits$2));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, (4194303 & m$1), (1048575 & h$1))
  } else {
    var h$2 = (this.l$2 << (((-44) + n) | 0));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return (this.l$2 | (this.m$2 << 22))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I = (function(value) {
  ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I.call(this, (4194303 & value), (4194303 & (value >> 22)), ((value < 0) ? 1048575 : 0));
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(that) {
  return (!this.equals__sjsr_RuntimeLong__Z(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var neg0 = (4194303 & ((1 + (~this.l$2)) | 0));
  var neg1 = (4194303 & (((~this.m$2) + ((neg0 === 0) ? 1 : 0)) | 0));
  var neg2 = (1048575 & (((~this.h$2) + (((neg0 === 0) && (neg1 === 0)) ? 1 : 0)) | 0));
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(neg0, neg1, neg2)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var sum0 = ((this.l$2 + y.l$2) | 0);
  var sum1 = ((((this.m$2 + y.m$2) | 0) + (sum0 >> 22)) | 0);
  var sum2 = ((((this.h$2 + y.h$2) | 0) + (sum1 >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & sum0), (4194303 & sum1), (1048575 & sum2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  var negative = ((524288 & this.h$2) !== 0);
  var xh = (negative ? ((-1048576) | this.h$2) : this.h$2);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (xh << remBits));
    var h = (xh >> n);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (xh << remBits$2));
    var m$1 = (xh >> shfBits);
    var h$1 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), (1048575 & h$1))
  } else {
    var l$2 = (xh >> (((-44) + n) | 0));
    var m$2 = (negative ? 4194303 : 0);
    var h$2 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), (4194303 & m$2), (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? (-9.223372036854776E18) : (((524288 & this.h$2) !== 0) ? (-this.unary$und$minus__sjsr_RuntimeLong().toDouble__D()) : ((this.l$2 + (4194304.0 * this.m$2)) + (1.7592186044416E13 * this.h$2))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[0])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.numberOfLeadingZeros__I = (function() {
  return ((this.h$2 !== 0) ? (((-12) + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.h$2)) | 0) : ((this.m$2 !== 0) ? ((10 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.m$2)) | 0) : ((32 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.l$2)) | 0)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.toInt__I() << 24) >> 24)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return this.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  var l = (~this.l$2);
  var m = (~this.m$2);
  var h = (~this.h$2);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return this.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y.unary$und$minus__sjsr_RuntimeLong())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return ScalaJS.fround(this.toDouble__D())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 ^ y.l$2), (this.m$2 ^ y.m$2), (this.h$2 ^ y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(y) {
  return (((this.l$2 === y.l$2) && (this.m$2 === y.m$2)) && (this.h$2 === y.h$2))
});
ScalaJS.is.sjsr_RuntimeLong = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.as.sjsr_RuntimeLong = (function(obj) {
  return ((ScalaJS.is.sjsr_RuntimeLong(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
});
ScalaJS.isArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.asArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
});
ScalaJS.d.sjsr_RuntimeLong = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", ScalaJS.d.jl_Number, {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong$ = (function() {
  ScalaJS.c.O.call(this);
  this.BITS$1 = 0;
  this.BITS01$1 = 0;
  this.BITS2$1 = 0;
  this.MASK$1 = 0;
  this.MASK$und2$1 = 0;
  this.SIGN$undBIT$1 = 0;
  this.SIGN$undBIT$undVALUE$1 = 0;
  this.TWO$undPWR$und15$undDBL$1 = 0.0;
  this.TWO$undPWR$und16$undDBL$1 = 0.0;
  this.TWO$undPWR$und22$undDBL$1 = 0.0;
  this.TWO$undPWR$und31$undDBL$1 = 0.0;
  this.TWO$undPWR$und32$undDBL$1 = 0.0;
  this.TWO$undPWR$und44$undDBL$1 = 0.0;
  this.TWO$undPWR$und63$undDBL$1 = 0.0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null;
  this.TenPow9$1 = null
});
ScalaJS.c.sjsr_RuntimeLong$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeLong$.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong$.prototype = ScalaJS.c.sjsr_RuntimeLong$.prototype;
ScalaJS.c.sjsr_RuntimeLong$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_RuntimeLong$ = this;
  this.Zero$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 0);
  this.One$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1, 0, 0);
  this.MinusOne$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 1048575);
  this.MinValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 524288);
  this.MaxValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 524287);
  this.TenPow9$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1755648, 238, 0);
  return this
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else if ((value < 0)) {
    return this.fromDouble__D__sjsr_RuntimeLong((-value)).unary$und$minus__sjsr_RuntimeLong()
  } else {
    var acc = value;
    var a2 = ((acc >= 1.7592186044416E13) ? ((acc / 1.7592186044416E13) | 0) : 0);
    acc = (acc - (1.7592186044416E13 * a2));
    var a1 = ((acc >= 4194304.0) ? ((acc / 4194304.0) | 0) : 0);
    acc = (acc - (4194304.0 * a1));
    var a0 = (acc | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(a0, a1, a2)
  }
});
ScalaJS.is.sjsr_RuntimeLong$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong$)))
});
ScalaJS.as.sjsr_RuntimeLong$ = (function(obj) {
  return ((ScalaJS.is.sjsr_RuntimeLong$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong$"))
});
ScalaJS.isArrayOf.sjsr_RuntimeLong$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong$)))
});
ScalaJS.asArrayOf.sjsr_RuntimeLong$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_RuntimeLong$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong$;", depth))
});
ScalaJS.d.sjsr_RuntimeLong$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", ScalaJS.d.O, {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong$;
ScalaJS.n.sjsr_RuntimeLong$ = (void 0);
ScalaJS.m.sjsr_RuntimeLong$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeLong$)) {
    ScalaJS.n.sjsr_RuntimeLong$ = new ScalaJS.c.sjsr_RuntimeLong$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeLong$
});
/** @constructor */
ScalaJS.c.Ljava_io_FilterOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this);
  this.out$2 = null
});
ScalaJS.c.Ljava_io_FilterOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.constructor = ScalaJS.c.Ljava_io_FilterOutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_FilterOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_FilterOutputStream.prototype = ScalaJS.c.Ljava_io_FilterOutputStream.prototype;
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
ScalaJS.is.Ljava_io_FilterOutputStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_FilterOutputStream)))
});
ScalaJS.as.Ljava_io_FilterOutputStream = (function(obj) {
  return ((ScalaJS.is.Ljava_io_FilterOutputStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.io.FilterOutputStream"))
});
ScalaJS.isArrayOf.Ljava_io_FilterOutputStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_FilterOutputStream)))
});
ScalaJS.asArrayOf.Ljava_io_FilterOutputStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljava_io_FilterOutputStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.io.FilterOutputStream;", depth))
});
ScalaJS.d.Ljava_io_FilterOutputStream = new ScalaJS.ClassTypeData({
  Ljava_io_FilterOutputStream: 0
}, false, "java.io.FilterOutputStream", ScalaJS.d.Ljava_io_OutputStream, {
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.$classData = ScalaJS.d.Ljava_io_FilterOutputStream;
ScalaJS.is.T = (function(obj) {
  return ((typeof obj) === "string")
});
ScalaJS.as.T = (function(obj) {
  return ((ScalaJS.is.T(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.String"))
});
ScalaJS.isArrayOf.T = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
});
ScalaJS.asArrayOf.T = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.String;", depth))
});
ScalaJS.d.T = new ScalaJS.ClassTypeData({
  T: 0
}, false, "java.lang.String", ScalaJS.d.O, {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, ScalaJS.is.T);
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this)
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
ScalaJS.is.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_JSConsoleBasedPrintStream$DummyOutputStream)))
});
ScalaJS.as.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function(obj) {
  return ((ScalaJS.is.jl_JSConsoleBasedPrintStream$DummyOutputStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream"))
});
ScalaJS.isArrayOf.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_JSConsoleBasedPrintStream$DummyOutputStream)))
});
ScalaJS.asArrayOf.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_JSConsoleBasedPrintStream$DummyOutputStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.JSConsoleBasedPrintStream$DummyOutputStream;", depth))
});
ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", ScalaJS.d.Ljava_io_OutputStream, {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.c.jl_RuntimeException = (function() {
  ScalaJS.c.jl_Exception.call(this)
});
ScalaJS.c.jl_RuntimeException.prototype = new ScalaJS.h.jl_Exception();
ScalaJS.c.jl_RuntimeException.prototype.constructor = ScalaJS.c.jl_RuntimeException;
/** @constructor */
ScalaJS.h.jl_RuntimeException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_RuntimeException.prototype = ScalaJS.c.jl_RuntimeException.prototype;
ScalaJS.c.jl_RuntimeException.prototype.init___ = (function() {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_RuntimeException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
ScalaJS.is.jl_RuntimeException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_RuntimeException)))
});
ScalaJS.as.jl_RuntimeException = (function(obj) {
  return ((ScalaJS.is.jl_RuntimeException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.RuntimeException"))
});
ScalaJS.isArrayOf.jl_RuntimeException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_RuntimeException)))
});
ScalaJS.asArrayOf.jl_RuntimeException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_RuntimeException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.RuntimeException;", depth))
});
ScalaJS.d.jl_RuntimeException = new ScalaJS.ClassTypeData({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", ScalaJS.d.jl_Exception, {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_RuntimeException.prototype.$classData = ScalaJS.d.jl_RuntimeException;
/** @constructor */
ScalaJS.c.jl_StringBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.content$1 = null
});
ScalaJS.c.jl_StringBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_StringBuilder.prototype.constructor = ScalaJS.c.jl_StringBuilder;
/** @constructor */
ScalaJS.h.jl_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_StringBuilder.prototype = ScalaJS.c.jl_StringBuilder.prototype;
ScalaJS.c.jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
ScalaJS.c.jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  ScalaJS.c.jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  var this$3 = new ScalaJS.c.jl_Character().init___C(c);
  var c$1 = this$3.value$1;
  return this.append__T__jl_StringBuilder(ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c$1)))
});
ScalaJS.c.jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
ScalaJS.is.jl_StringBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_StringBuilder)))
});
ScalaJS.as.jl_StringBuilder = (function(obj) {
  return ((ScalaJS.is.jl_StringBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.StringBuilder"))
});
ScalaJS.isArrayOf.jl_StringBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_StringBuilder)))
});
ScalaJS.asArrayOf.jl_StringBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_StringBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.StringBuilder;", depth))
});
ScalaJS.d.jl_StringBuilder = new ScalaJS.ClassTypeData({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", ScalaJS.d.O, {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_StringBuilder.prototype.$classData = ScalaJS.d.jl_StringBuilder;
/** @constructor */
ScalaJS.c.sc_AbstractIterator = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractIterator.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractIterator.prototype.constructor = ScalaJS.c.sc_AbstractIterator;
/** @constructor */
ScalaJS.h.sc_AbstractIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterator.prototype = ScalaJS.c.sc_AbstractIterator.prototype;
ScalaJS.c.sc_AbstractIterator.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.toString__T = (function() {
  return ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
ScalaJS.c.sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.is.sc_AbstractIterator = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractIterator)))
});
ScalaJS.as.sc_AbstractIterator = (function(obj) {
  return ((ScalaJS.is.sc_AbstractIterator(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.AbstractIterator"))
});
ScalaJS.isArrayOf.sc_AbstractIterator = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractIterator)))
});
ScalaJS.asArrayOf.sc_AbstractIterator = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_AbstractIterator(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.AbstractIterator;", depth))
});
ScalaJS.d.sc_AbstractIterator = new ScalaJS.ClassTypeData({
  sc_AbstractIterator: 0
}, false, "scala.collection.AbstractIterator", ScalaJS.d.O, {
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_AbstractIterator.prototype.$classData = ScalaJS.d.sc_AbstractIterator;
/** @constructor */
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator = (function() {
  ScalaJS.c.O.call(this);
  this.dict$1 = null;
  this.keys$1 = null;
  this.index$1 = 0
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype = new ScalaJS.h.O();
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.constructor = ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator;
/** @constructor */
ScalaJS.h.sjs_js_WrappedDictionary$DictionaryIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedDictionary$DictionaryIterator.prototype = ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype;
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.next__O = (function() {
  return this.next__T2()
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.init___sjs_js_Dictionary = (function(dict) {
  this.dict$1 = dict;
  this.keys$1 = ScalaJS.g["Object"]["keys"](dict);
  this.index$1 = 0;
  return this
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.toString__T = (function() {
  return ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T(this)
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.next__T2 = (function() {
  var key = ScalaJS.as.T(this.keys$1[this.index$1]);
  this.index$1 = ((1 + this.index$1) | 0);
  var dict = this.dict$1;
  if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, key))) {
    var jsx$1 = dict[key]
  } else {
    var jsx$1;
    throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + key))
  };
  return new ScalaJS.c.T2().init___O__O(key, jsx$1)
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.hasNext__Z = (function() {
  return (this.index$1 < ScalaJS.uI(this.keys$1["length"]))
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.is.sjs_js_WrappedDictionary$DictionaryIterator = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedDictionary$DictionaryIterator)))
});
ScalaJS.as.sjs_js_WrappedDictionary$DictionaryIterator = (function(obj) {
  return ((ScalaJS.is.sjs_js_WrappedDictionary$DictionaryIterator(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.WrappedDictionary$DictionaryIterator"))
});
ScalaJS.isArrayOf.sjs_js_WrappedDictionary$DictionaryIterator = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedDictionary$DictionaryIterator)))
});
ScalaJS.asArrayOf.sjs_js_WrappedDictionary$DictionaryIterator = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_WrappedDictionary$DictionaryIterator(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.WrappedDictionary$DictionaryIterator;", depth))
});
ScalaJS.d.sjs_js_WrappedDictionary$DictionaryIterator = new ScalaJS.ClassTypeData({
  sjs_js_WrappedDictionary$DictionaryIterator: 0
}, false, "scala.scalajs.js.WrappedDictionary$DictionaryIterator", ScalaJS.d.O, {
  sjs_js_WrappedDictionary$DictionaryIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator.prototype.$classData = ScalaJS.d.sjs_js_WrappedDictionary$DictionaryIterator;
/** @constructor */
ScalaJS.c.LChromi3wm$Root$$anonfun$4 = (function() {
  ScalaJS.c.sr_AbstractFunction1.call(this);
  this.$$outer$2 = null
});
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype = new ScalaJS.h.sr_AbstractFunction1();
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype.constructor = ScalaJS.c.LChromi3wm$Root$$anonfun$4;
/** @constructor */
ScalaJS.h.LChromi3wm$Root$$anonfun$4 = (function() {
  /*<skip>*/
});
ScalaJS.h.LChromi3wm$Root$$anonfun$4.prototype = ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype;
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype.apply__O__O = (function(v1) {
  this.apply__LChromi3wm$Output__V(ScalaJS.as.LChromi3wm$Output(v1))
});
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype.init___LChromi3wm$Root = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype.apply__LChromi3wm$Output__V = (function(o) {
  var $$this = o.content$2;
  if (($$this !== (void 0))) {
    var c = ScalaJS.as.LChromi3wm$Content($$this);
    var array = c.workspaces$2;
    var i = 0;
    var len = ScalaJS.uI(array["length"]);
    while ((i < len)) {
      var index = i;
      var arg1 = array[index];
      var w = ScalaJS.as.LChromi3wm$Workspace(arg1);
      this.$$outer$2.workspaces$2[w.key$2] = w;
      i = ((1 + i) | 0)
    }
  }
});
ScalaJS.is.LChromi3wm$Root$$anonfun$4 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.LChromi3wm$Root$$anonfun$4)))
});
ScalaJS.as.LChromi3wm$Root$$anonfun$4 = (function(obj) {
  return ((ScalaJS.is.LChromi3wm$Root$$anonfun$4(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "Chromi3wm$Root$$anonfun$4"))
});
ScalaJS.isArrayOf.LChromi3wm$Root$$anonfun$4 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LChromi3wm$Root$$anonfun$4)))
});
ScalaJS.asArrayOf.LChromi3wm$Root$$anonfun$4 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.LChromi3wm$Root$$anonfun$4(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "LChromi3wm$Root$$anonfun$4;", depth))
});
ScalaJS.d.LChromi3wm$Root$$anonfun$4 = new ScalaJS.ClassTypeData({
  LChromi3wm$Root$$anonfun$4: 0
}, false, "Chromi3wm$Root$$anonfun$4", ScalaJS.d.sr_AbstractFunction1, {
  LChromi3wm$Root$$anonfun$4: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.LChromi3wm$Root$$anonfun$4.prototype.$classData = ScalaJS.d.LChromi3wm$Root$$anonfun$4;
/** @constructor */
ScalaJS.c.jl_ArithmeticException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ArithmeticException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ArithmeticException.prototype.constructor = ScalaJS.c.jl_ArithmeticException;
/** @constructor */
ScalaJS.h.jl_ArithmeticException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ArithmeticException.prototype = ScalaJS.c.jl_ArithmeticException.prototype;
ScalaJS.is.jl_ArithmeticException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ArithmeticException)))
});
ScalaJS.as.jl_ArithmeticException = (function(obj) {
  return ((ScalaJS.is.jl_ArithmeticException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.ArithmeticException"))
});
ScalaJS.isArrayOf.jl_ArithmeticException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ArithmeticException)))
});
ScalaJS.asArrayOf.jl_ArithmeticException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_ArithmeticException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.ArithmeticException;", depth))
});
ScalaJS.d.jl_ArithmeticException = new ScalaJS.ClassTypeData({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", ScalaJS.d.jl_RuntimeException, {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ArithmeticException.prototype.$classData = ScalaJS.d.jl_ArithmeticException;
/** @constructor */
ScalaJS.c.jl_ClassCastException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ClassCastException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ClassCastException.prototype.constructor = ScalaJS.c.jl_ClassCastException;
/** @constructor */
ScalaJS.h.jl_ClassCastException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ClassCastException.prototype = ScalaJS.c.jl_ClassCastException.prototype;
ScalaJS.is.jl_ClassCastException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
});
ScalaJS.as.jl_ClassCastException = (function(obj) {
  return ((ScalaJS.is.jl_ClassCastException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.ClassCastException"))
});
ScalaJS.isArrayOf.jl_ClassCastException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
});
ScalaJS.asArrayOf.jl_ClassCastException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_ClassCastException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
});
ScalaJS.d.jl_ClassCastException = new ScalaJS.ClassTypeData({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", ScalaJS.d.jl_RuntimeException, {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ClassCastException.prototype.$classData = ScalaJS.d.jl_ClassCastException;
/** @constructor */
ScalaJS.c.jl_IllegalArgumentException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IllegalArgumentException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IllegalArgumentException.prototype.constructor = ScalaJS.c.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.h.jl_IllegalArgumentException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IllegalArgumentException.prototype = ScalaJS.c.jl_IllegalArgumentException.prototype;
ScalaJS.c.jl_IllegalArgumentException.prototype.init___ = (function() {
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.is.jl_IllegalArgumentException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_IllegalArgumentException)))
});
ScalaJS.as.jl_IllegalArgumentException = (function(obj) {
  return ((ScalaJS.is.jl_IllegalArgumentException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.IllegalArgumentException"))
});
ScalaJS.isArrayOf.jl_IllegalArgumentException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_IllegalArgumentException)))
});
ScalaJS.asArrayOf.jl_IllegalArgumentException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_IllegalArgumentException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.IllegalArgumentException;", depth))
});
ScalaJS.d.jl_IllegalArgumentException = new ScalaJS.ClassTypeData({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", ScalaJS.d.jl_RuntimeException, {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IllegalArgumentException.prototype.$classData = ScalaJS.d.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.c.jl_IndexOutOfBoundsException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.constructor = ScalaJS.c.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.h.jl_IndexOutOfBoundsException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IndexOutOfBoundsException.prototype = ScalaJS.c.jl_IndexOutOfBoundsException.prototype;
ScalaJS.is.jl_IndexOutOfBoundsException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_IndexOutOfBoundsException)))
});
ScalaJS.as.jl_IndexOutOfBoundsException = (function(obj) {
  return ((ScalaJS.is.jl_IndexOutOfBoundsException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.IndexOutOfBoundsException"))
});
ScalaJS.isArrayOf.jl_IndexOutOfBoundsException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_IndexOutOfBoundsException)))
});
ScalaJS.asArrayOf.jl_IndexOutOfBoundsException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_IndexOutOfBoundsException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.IndexOutOfBoundsException;", depth))
});
ScalaJS.d.jl_IndexOutOfBoundsException = new ScalaJS.ClassTypeData({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", ScalaJS.d.jl_RuntimeException, {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.$classData = ScalaJS.d.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.c.jl_NullPointerException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_NullPointerException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_NullPointerException.prototype.constructor = ScalaJS.c.jl_NullPointerException;
/** @constructor */
ScalaJS.h.jl_NullPointerException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_NullPointerException.prototype = ScalaJS.c.jl_NullPointerException.prototype;
ScalaJS.c.jl_NullPointerException.prototype.init___ = (function() {
  ScalaJS.c.jl_NullPointerException.prototype.init___T.call(this, null);
  return this
});
ScalaJS.is.jl_NullPointerException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_NullPointerException)))
});
ScalaJS.as.jl_NullPointerException = (function(obj) {
  return ((ScalaJS.is.jl_NullPointerException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.NullPointerException"))
});
ScalaJS.isArrayOf.jl_NullPointerException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_NullPointerException)))
});
ScalaJS.asArrayOf.jl_NullPointerException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_NullPointerException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.NullPointerException;", depth))
});
ScalaJS.d.jl_NullPointerException = new ScalaJS.ClassTypeData({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", ScalaJS.d.jl_RuntimeException, {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_NullPointerException.prototype.$classData = ScalaJS.d.jl_NullPointerException;
/** @constructor */
ScalaJS.c.ju_NoSuchElementException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.ju_NoSuchElementException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.ju_NoSuchElementException.prototype.constructor = ScalaJS.c.ju_NoSuchElementException;
/** @constructor */
ScalaJS.h.ju_NoSuchElementException = (function() {
  /*<skip>*/
});
ScalaJS.h.ju_NoSuchElementException.prototype = ScalaJS.c.ju_NoSuchElementException.prototype;
ScalaJS.is.ju_NoSuchElementException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_NoSuchElementException)))
});
ScalaJS.as.ju_NoSuchElementException = (function(obj) {
  return ((ScalaJS.is.ju_NoSuchElementException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.util.NoSuchElementException"))
});
ScalaJS.isArrayOf.ju_NoSuchElementException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_NoSuchElementException)))
});
ScalaJS.asArrayOf.ju_NoSuchElementException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.ju_NoSuchElementException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.util.NoSuchElementException;", depth))
});
ScalaJS.d.ju_NoSuchElementException = new ScalaJS.ClassTypeData({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", ScalaJS.d.jl_RuntimeException, {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.ju_NoSuchElementException.prototype.$classData = ScalaJS.d.ju_NoSuchElementException;
/** @constructor */
ScalaJS.c.s_MatchError = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
});
ScalaJS.c.s_MatchError.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.s_MatchError.prototype.constructor = ScalaJS.c.s_MatchError;
/** @constructor */
ScalaJS.h.s_MatchError = (function() {
  /*<skip>*/
});
ScalaJS.h.s_MatchError.prototype = ScalaJS.c.s_MatchError.prototype;
ScalaJS.c.s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
ScalaJS.c.s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + ScalaJS.objectGetClass(this.obj$4).getName__T())
});
ScalaJS.c.s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return (((ScalaJS.objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
ScalaJS.c.s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
ScalaJS.c.s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
ScalaJS.c.s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.is.s_MatchError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_MatchError)))
});
ScalaJS.as.s_MatchError = (function(obj) {
  return ((ScalaJS.is.s_MatchError(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.MatchError"))
});
ScalaJS.isArrayOf.s_MatchError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_MatchError)))
});
ScalaJS.asArrayOf.s_MatchError = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_MatchError(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.MatchError;", depth))
});
ScalaJS.d.s_MatchError = new ScalaJS.ClassTypeData({
  s_MatchError: 0
}, false, "scala.MatchError", ScalaJS.d.jl_RuntimeException, {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_MatchError.prototype.$classData = ScalaJS.d.s_MatchError;
/** @constructor */
ScalaJS.c.s_Option = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_Option.prototype = new ScalaJS.h.O();
ScalaJS.c.s_Option.prototype.constructor = ScalaJS.c.s_Option;
/** @constructor */
ScalaJS.h.s_Option = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Option.prototype = ScalaJS.c.s_Option.prototype;
ScalaJS.c.s_Option.prototype.init___ = (function() {
  return this
});
ScalaJS.is.s_Option = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Option)))
});
ScalaJS.as.s_Option = (function(obj) {
  return ((ScalaJS.is.s_Option(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Option"))
});
ScalaJS.isArrayOf.s_Option = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Option)))
});
ScalaJS.asArrayOf.s_Option = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_Option(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Option;", depth))
});
ScalaJS.d.s_Option = new ScalaJS.ClassTypeData({
  s_Option: 0
}, false, "scala.Option", ScalaJS.d.O, {
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Option.prototype.$classData = ScalaJS.d.s_Option;
/** @constructor */
ScalaJS.c.sc_Iterator$$anon$11 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$3$2 = null
});
ScalaJS.c.sc_Iterator$$anon$11.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_Iterator$$anon$11.prototype.constructor = ScalaJS.c.sc_Iterator$$anon$11;
/** @constructor */
ScalaJS.h.sc_Iterator$$anon$11 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$$anon$11.prototype = ScalaJS.c.sc_Iterator$$anon$11.prototype;
ScalaJS.c.sc_Iterator$$anon$11.prototype.next__O = (function() {
  return this.f$3$2.apply__O__O(this.$$outer$2.next__O())
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.init___sc_Iterator__F1 = (function($$outer, f$3) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$3$2 = f$3;
  return this
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
ScalaJS.is.sc_Iterator$$anon$11 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterator$$anon$11)))
});
ScalaJS.as.sc_Iterator$$anon$11 = (function(obj) {
  return ((ScalaJS.is.sc_Iterator$$anon$11(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.Iterator$$anon$11"))
});
ScalaJS.isArrayOf.sc_Iterator$$anon$11 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator$$anon$11)))
});
ScalaJS.asArrayOf.sc_Iterator$$anon$11 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_Iterator$$anon$11(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.Iterator$$anon$11;", depth))
});
ScalaJS.d.sc_Iterator$$anon$11 = new ScalaJS.ClassTypeData({
  sc_Iterator$$anon$11: 0
}, false, "scala.collection.Iterator$$anon$11", ScalaJS.d.sc_AbstractIterator, {
  sc_Iterator$$anon$11: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_Iterator$$anon$11.prototype.$classData = ScalaJS.d.sc_Iterator$$anon$11;
/** @constructor */
ScalaJS.c.sc_Iterator$$anon$2 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this)
});
ScalaJS.c.sc_Iterator$$anon$2.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_Iterator$$anon$2.prototype.constructor = ScalaJS.c.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.h.sc_Iterator$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$$anon$2.prototype = ScalaJS.c.sc_Iterator$$anon$2.prototype;
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty iterator")
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
ScalaJS.is.sc_Iterator$$anon$2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterator$$anon$2)))
});
ScalaJS.as.sc_Iterator$$anon$2 = (function(obj) {
  return ((ScalaJS.is.sc_Iterator$$anon$2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.Iterator$$anon$2"))
});
ScalaJS.isArrayOf.sc_Iterator$$anon$2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator$$anon$2)))
});
ScalaJS.asArrayOf.sc_Iterator$$anon$2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_Iterator$$anon$2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.Iterator$$anon$2;", depth))
});
ScalaJS.d.sc_Iterator$$anon$2 = new ScalaJS.ClassTypeData({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", ScalaJS.d.sc_AbstractIterator, {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.$classData = ScalaJS.d.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.c.sc_MapLike$$anon$2 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.iter$2 = null
});
ScalaJS.c.sc_MapLike$$anon$2.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_MapLike$$anon$2.prototype.constructor = ScalaJS.c.sc_MapLike$$anon$2;
/** @constructor */
ScalaJS.h.sc_MapLike$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_MapLike$$anon$2.prototype = ScalaJS.c.sc_MapLike$$anon$2.prototype;
ScalaJS.c.sc_MapLike$$anon$2.prototype.next__O = (function() {
  return ScalaJS.as.T2(this.iter$2.next__O()).$$und2$f
});
ScalaJS.c.sc_MapLike$$anon$2.prototype.hasNext__Z = (function() {
  return this.iter$2.hasNext__Z()
});
ScalaJS.c.sc_MapLike$$anon$2.prototype.init___sc_MapLike = (function($$outer) {
  this.iter$2 = new ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary($$outer.dict$5);
  return this
});
ScalaJS.is.sc_MapLike$$anon$2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_MapLike$$anon$2)))
});
ScalaJS.as.sc_MapLike$$anon$2 = (function(obj) {
  return ((ScalaJS.is.sc_MapLike$$anon$2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.MapLike$$anon$2"))
});
ScalaJS.isArrayOf.sc_MapLike$$anon$2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_MapLike$$anon$2)))
});
ScalaJS.asArrayOf.sc_MapLike$$anon$2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_MapLike$$anon$2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.MapLike$$anon$2;", depth))
});
ScalaJS.d.sc_MapLike$$anon$2 = new ScalaJS.ClassTypeData({
  sc_MapLike$$anon$2: 0
}, false, "scala.collection.MapLike$$anon$2", ScalaJS.d.sc_AbstractIterator, {
  sc_MapLike$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_MapLike$$anon$2.prototype.$classData = ScalaJS.d.sc_MapLike$$anon$2;
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$$anon$1.prototype = ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype;
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
ScalaJS.is.sr_ScalaRunTime$$anon$1 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_ScalaRunTime$$anon$1)))
});
ScalaJS.as.sr_ScalaRunTime$$anon$1 = (function(obj) {
  return ((ScalaJS.is.sr_ScalaRunTime$$anon$1(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.runtime.ScalaRunTime$$anon$1"))
});
ScalaJS.isArrayOf.sr_ScalaRunTime$$anon$1 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_ScalaRunTime$$anon$1)))
});
ScalaJS.asArrayOf.sr_ScalaRunTime$$anon$1 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_ScalaRunTime$$anon$1(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.ScalaRunTime$$anon$1;", depth))
});
ScalaJS.d.sr_ScalaRunTime$$anon$1 = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", ScalaJS.d.sc_AbstractIterator, {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.c.Ljava_io_PrintStream = (function() {
  ScalaJS.c.Ljava_io_FilterOutputStream.call(this);
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.encoder$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
});
ScalaJS.c.Ljava_io_PrintStream.prototype = new ScalaJS.h.Ljava_io_FilterOutputStream();
ScalaJS.c.Ljava_io_PrintStream.prototype.constructor = ScalaJS.c.Ljava_io_PrintStream;
/** @constructor */
ScalaJS.h.Ljava_io_PrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_PrintStream.prototype = ScalaJS.c.Ljava_io_PrintStream.prototype;
ScalaJS.c.Ljava_io_PrintStream.prototype.println__O__V = (function(obj) {
  this.print__O__V(obj);
  this.printString__p4__T__V("\n")
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  return this
});
ScalaJS.is.Ljava_io_PrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.as.Ljava_io_PrintStream = (function(obj) {
  return ((ScalaJS.is.Ljava_io_PrintStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.io.PrintStream"))
});
ScalaJS.isArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.asArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
});
ScalaJS.d.Ljava_io_PrintStream = new ScalaJS.ClassTypeData({
  Ljava_io_PrintStream: 0
}, false, "java.io.PrintStream", ScalaJS.d.Ljava_io_FilterOutputStream, {
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
ScalaJS.c.Ljava_io_PrintStream.prototype.$classData = ScalaJS.d.Ljava_io_PrintStream;
/** @constructor */
ScalaJS.c.T2 = (function() {
  ScalaJS.c.O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
});
ScalaJS.c.T2.prototype = new ScalaJS.h.O();
ScalaJS.c.T2.prototype.constructor = ScalaJS.c.T2;
/** @constructor */
ScalaJS.h.T2 = (function() {
  /*<skip>*/
});
ScalaJS.h.T2.prototype = ScalaJS.c.T2.prototype;
ScalaJS.c.T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
ScalaJS.c.T2.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.T2(x$1)) {
    var Tuple2$1 = ScalaJS.as.T2(x$1);
    return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
ScalaJS.c.T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
ScalaJS.c.T2.prototype.productElement__I__O = (function(n) {
  return ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O(this, n)
});
ScalaJS.c.T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
ScalaJS.c.T2.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.T2.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.T2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
});
ScalaJS.as.T2 = (function(obj) {
  return ((ScalaJS.is.T2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Tuple2"))
});
ScalaJS.isArrayOf.T2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
});
ScalaJS.asArrayOf.T2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Tuple2;", depth))
});
ScalaJS.d.T2 = new ScalaJS.ClassTypeData({
  T2: 0
}, false, "scala.Tuple2", ScalaJS.d.O, {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.T2.prototype.$classData = ScalaJS.d.T2;
/** @constructor */
ScalaJS.c.s_None$ = (function() {
  ScalaJS.c.s_Option.call(this)
});
ScalaJS.c.s_None$.prototype = new ScalaJS.h.s_Option();
ScalaJS.c.s_None$.prototype.constructor = ScalaJS.c.s_None$;
/** @constructor */
ScalaJS.h.s_None$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_None$.prototype = ScalaJS.c.s_None$.prototype;
ScalaJS.c.s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
ScalaJS.c.s_None$.prototype.productArity__I = (function() {
  return 0
});
ScalaJS.c.s_None$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
ScalaJS.c.s_None$.prototype.toString__T = (function() {
  return "None"
});
ScalaJS.c.s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
ScalaJS.c.s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_None$ = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_None$)))
});
ScalaJS.as.s_None$ = (function(obj) {
  return ((ScalaJS.is.s_None$(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.None$"))
});
ScalaJS.isArrayOf.s_None$ = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_None$)))
});
ScalaJS.asArrayOf.s_None$ = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_None$(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.None$;", depth))
});
ScalaJS.d.s_None$ = new ScalaJS.ClassTypeData({
  s_None$: 0
}, false, "scala.None$", ScalaJS.d.s_Option, {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_None$.prototype.$classData = ScalaJS.d.s_None$;
ScalaJS.n.s_None$ = (void 0);
ScalaJS.m.s_None$ = (function() {
  if ((!ScalaJS.n.s_None$)) {
    ScalaJS.n.s_None$ = new ScalaJS.c.s_None$().init___()
  };
  return ScalaJS.n.s_None$
});
/** @constructor */
ScalaJS.c.s_Some = (function() {
  ScalaJS.c.s_Option.call(this);
  this.x$2 = null
});
ScalaJS.c.s_Some.prototype = new ScalaJS.h.s_Option();
ScalaJS.c.s_Some.prototype.constructor = ScalaJS.c.s_Some;
/** @constructor */
ScalaJS.h.s_Some = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Some.prototype = ScalaJS.c.s_Some.prototype;
ScalaJS.c.s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
ScalaJS.c.s_Some.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.s_Some(x$1)) {
    var Some$1 = ScalaJS.as.s_Some(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.x$2, Some$1.x$2)
  } else {
    return false
  }
});
ScalaJS.c.s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.x$2;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.s_Some.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.s_Some.prototype.init___O = (function(x) {
  this.x$2 = x;
  return this
});
ScalaJS.c.s_Some.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_Some = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
});
ScalaJS.as.s_Some = (function(obj) {
  return ((ScalaJS.is.s_Some(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Some"))
});
ScalaJS.isArrayOf.s_Some = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
});
ScalaJS.asArrayOf.s_Some = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_Some(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Some;", depth))
});
ScalaJS.d.s_Some = new ScalaJS.ClassTypeData({
  s_Some: 0
}, false, "scala.Some", ScalaJS.d.s_Option, {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Some.prototype.$classData = ScalaJS.d.s_Some;
/** @constructor */
ScalaJS.c.sjsr_UndefinedBehaviorError = (function() {
  ScalaJS.c.jl_Error.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype = new ScalaJS.h.jl_Error();
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.constructor = ScalaJS.c.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.h.sjsr_UndefinedBehaviorError = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_UndefinedBehaviorError.prototype = ScalaJS.c.sjsr_UndefinedBehaviorError.prototype;
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  ScalaJS.c.jl_Error.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
ScalaJS.is.sjsr_UndefinedBehaviorError = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_UndefinedBehaviorError)))
});
ScalaJS.as.sjsr_UndefinedBehaviorError = (function(obj) {
  return ((ScalaJS.is.sjsr_UndefinedBehaviorError(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.UndefinedBehaviorError"))
});
ScalaJS.isArrayOf.sjsr_UndefinedBehaviorError = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_UndefinedBehaviorError)))
});
ScalaJS.asArrayOf.sjsr_UndefinedBehaviorError = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_UndefinedBehaviorError(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.UndefinedBehaviorError;", depth))
});
ScalaJS.d.sjsr_UndefinedBehaviorError = new ScalaJS.ClassTypeData({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", ScalaJS.d.jl_Error, {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.$classData = ScalaJS.d.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream = (function() {
  ScalaJS.c.Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype = new ScalaJS.h.Ljava_io_PrintStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype;
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream.call(this, new ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream().init___());
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = ScalaJS.g["console"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if (ScalaJS.uZ(x$1)) {
      var x$2 = ScalaJS.g["console"]["error"];
      var jsx$1 = ScalaJS.uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      ScalaJS.g["console"]["error"](line)
    } else {
      ScalaJS.g["console"]["log"](line)
    }
  }
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.print__O__V = (function(obj) {
  this.printString__p4__T__V(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(obj))
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.printString__p4__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = ScalaJS.uI(thiz["indexOf"]("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + ScalaJS.as.T(thiz$1["substring"](0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = ScalaJS.as.T(thiz$2["substring"](beginIndex))
    }
  }
});
ScalaJS.is.jl_JSConsoleBasedPrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_JSConsoleBasedPrintStream)))
});
ScalaJS.as.jl_JSConsoleBasedPrintStream = (function(obj) {
  return ((ScalaJS.is.jl_JSConsoleBasedPrintStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.JSConsoleBasedPrintStream"))
});
ScalaJS.isArrayOf.jl_JSConsoleBasedPrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_JSConsoleBasedPrintStream)))
});
ScalaJS.asArrayOf.jl_JSConsoleBasedPrintStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_JSConsoleBasedPrintStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.JSConsoleBasedPrintStream;", depth))
});
ScalaJS.d.jl_JSConsoleBasedPrintStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", ScalaJS.d.Ljava_io_PrintStream, {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.c.sc_IndexedSeqLike$Elements = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$f = null
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.constructor = ScalaJS.c.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.h.sc_IndexedSeqLike$Elements = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeqLike$Elements.prototype = ScalaJS.c.sc_IndexedSeqLike$Elements.prototype;
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    ScalaJS.m.sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$f.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  this.index$2 = start;
  return this
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
ScalaJS.is.sc_IndexedSeqLike$Elements = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike$Elements)))
});
ScalaJS.as.sc_IndexedSeqLike$Elements = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeqLike$Elements(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeqLike$Elements"))
});
ScalaJS.isArrayOf.sc_IndexedSeqLike$Elements = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike$Elements)))
});
ScalaJS.asArrayOf.sc_IndexedSeqLike$Elements = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeqLike$Elements(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike$Elements;", depth))
});
ScalaJS.d.sc_IndexedSeqLike$Elements = new ScalaJS.ClassTypeData({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", ScalaJS.d.sc_AbstractIterator, {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.$classData = ScalaJS.d.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.c.sjs_js_JavaScriptException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.exception$4 = null
});
ScalaJS.c.sjs_js_JavaScriptException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.sjs_js_JavaScriptException.prototype.constructor = ScalaJS.c.sjs_js_JavaScriptException;
/** @constructor */
ScalaJS.h.sjs_js_JavaScriptException = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_JavaScriptException.prototype = ScalaJS.c.sjs_js_JavaScriptException.prototype;
ScalaJS.c.sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  ScalaJS.m.sjsr_StackTrace$().captureState__jl_Throwable__O__V(this, this.exception$4);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = ScalaJS.as.sjs_js_JavaScriptException(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.exception$4;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return ScalaJS.objectToString(this.exception$4)
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.sjs_js_JavaScriptException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.as.sjs_js_JavaScriptException = (function(obj) {
  return ((ScalaJS.is.sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
});
ScalaJS.isArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.asArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
});
ScalaJS.d.sjs_js_JavaScriptException = new ScalaJS.ClassTypeData({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", ScalaJS.d.jl_RuntimeException, {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.$classData = ScalaJS.d.sjs_js_JavaScriptException;
ScalaJS.is.sc_GenMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
});
ScalaJS.as.sc_GenMap = (function(obj) {
  return ((ScalaJS.is.sc_GenMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenMap"))
});
ScalaJS.isArrayOf.sc_GenMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
});
ScalaJS.asArrayOf.sc_GenMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenMap;", depth))
});
ScalaJS.d.sc_GenMap = new ScalaJS.ClassTypeData({
  sc_GenMap: 0
}, true, "scala.collection.GenMap", (void 0), {
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_GenIterableLike: 1,
  sc_GenTraversableLike: 1,
  sc_GenTraversableOnce: 1,
  sc_Parallelizable: 1,
  s_Equals: 1,
  sc_GenIterable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  scg_HasNewBuilder: 1
});
ScalaJS.is.sc_GenSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
});
ScalaJS.as.sc_GenSeq = (function(obj) {
  return ((ScalaJS.is.sc_GenSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenSeq"))
});
ScalaJS.isArrayOf.sc_GenSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
});
ScalaJS.asArrayOf.sc_GenSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
});
ScalaJS.d.sc_GenSeq = new ScalaJS.ClassTypeData({
  sc_GenSeq: 0
}, true, "scala.collection.GenSeq", (void 0), {
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_GenIterableLike: 1,
  sc_GenTraversableLike: 1,
  sc_GenTraversableOnce: 1,
  sc_Parallelizable: 1,
  s_Equals: 1,
  sc_GenIterable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  scg_HasNewBuilder: 1
});
/** @constructor */
ScalaJS.c.sc_AbstractTraversable = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractTraversable.prototype.constructor = ScalaJS.c.sc_AbstractTraversable;
/** @constructor */
ScalaJS.h.sc_AbstractTraversable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractTraversable.prototype = ScalaJS.c.sc_AbstractTraversable.prototype;
ScalaJS.c.sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype.size__I = (function() {
  return ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
ScalaJS.c.sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
ScalaJS.is.sc_AbstractTraversable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractTraversable)))
});
ScalaJS.as.sc_AbstractTraversable = (function(obj) {
  return ((ScalaJS.is.sc_AbstractTraversable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.AbstractTraversable"))
});
ScalaJS.isArrayOf.sc_AbstractTraversable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractTraversable)))
});
ScalaJS.asArrayOf.sc_AbstractTraversable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_AbstractTraversable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.AbstractTraversable;", depth))
});
ScalaJS.d.sc_AbstractTraversable = new ScalaJS.ClassTypeData({
  sc_AbstractTraversable: 0
}, false, "scala.collection.AbstractTraversable", ScalaJS.d.O, {
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1
});
ScalaJS.c.sc_AbstractTraversable.prototype.$classData = ScalaJS.d.sc_AbstractTraversable;
ScalaJS.is.sc_IndexedSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.as.sc_IndexedSeqLike = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeqLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
});
ScalaJS.isArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.asArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
});
ScalaJS.d.sc_IndexedSeqLike = new ScalaJS.ClassTypeData({
  sc_IndexedSeqLike: 0
}, true, "scala.collection.IndexedSeqLike", (void 0), {
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1
});
/** @constructor */
ScalaJS.c.sc_AbstractIterable = (function() {
  ScalaJS.c.sc_AbstractTraversable.call(this)
});
ScalaJS.c.sc_AbstractIterable.prototype = new ScalaJS.h.sc_AbstractTraversable();
ScalaJS.c.sc_AbstractIterable.prototype.constructor = ScalaJS.c.sc_AbstractIterable;
/** @constructor */
ScalaJS.h.sc_AbstractIterable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterable.prototype = ScalaJS.c.sc_AbstractIterable.prototype;
ScalaJS.c.sc_AbstractIterable.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IterableLike$class__isEmpty__sc_IterableLike__Z(this)
});
ScalaJS.c.sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$1, f)
});
ScalaJS.is.sc_AbstractIterable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractIterable)))
});
ScalaJS.as.sc_AbstractIterable = (function(obj) {
  return ((ScalaJS.is.sc_AbstractIterable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.AbstractIterable"))
});
ScalaJS.isArrayOf.sc_AbstractIterable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractIterable)))
});
ScalaJS.asArrayOf.sc_AbstractIterable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_AbstractIterable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.AbstractIterable;", depth))
});
ScalaJS.d.sc_AbstractIterable = new ScalaJS.ClassTypeData({
  sc_AbstractIterable: 0
}, false, "scala.collection.AbstractIterable", ScalaJS.d.sc_AbstractTraversable, {
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
ScalaJS.c.sc_AbstractIterable.prototype.$classData = ScalaJS.d.sc_AbstractIterable;
/** @constructor */
ScalaJS.c.sc_MapLike$DefaultValuesIterable = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this);
  this.$$outer$f = null
});
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.constructor = ScalaJS.c.sc_MapLike$DefaultValuesIterable;
/** @constructor */
ScalaJS.h.sc_MapLike$DefaultValuesIterable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_MapLike$DefaultValuesIterable.prototype = ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype;
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.$$outer$f;
  var this$2 = new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$1);
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$2, f)
});
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.size__I = (function() {
  var this$1 = this.$$outer$f;
  return ScalaJS.s.sc_TraversableOnce$class__size__sc_TraversableOnce__I(this$1)
});
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.$$outer$f;
  return new ScalaJS.c.sc_MapLike$$anon$2().init___sc_MapLike(this$1)
});
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.init___sc_MapLike = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.is.sc_MapLike$DefaultValuesIterable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_MapLike$DefaultValuesIterable)))
});
ScalaJS.as.sc_MapLike$DefaultValuesIterable = (function(obj) {
  return ((ScalaJS.is.sc_MapLike$DefaultValuesIterable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.MapLike$DefaultValuesIterable"))
});
ScalaJS.isArrayOf.sc_MapLike$DefaultValuesIterable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_MapLike$DefaultValuesIterable)))
});
ScalaJS.asArrayOf.sc_MapLike$DefaultValuesIterable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_MapLike$DefaultValuesIterable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.MapLike$DefaultValuesIterable;", depth))
});
ScalaJS.d.sc_MapLike$DefaultValuesIterable = new ScalaJS.ClassTypeData({
  sc_MapLike$DefaultValuesIterable: 0
}, false, "scala.collection.MapLike$DefaultValuesIterable", ScalaJS.d.sc_AbstractIterable, {
  sc_MapLike$DefaultValuesIterable: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sc_MapLike$DefaultValuesIterable.prototype.$classData = ScalaJS.d.sc_MapLike$DefaultValuesIterable;
/** @constructor */
ScalaJS.c.sjs_js_ArrayOps = (function() {
  ScalaJS.c.O.call(this);
  this.scala$scalajs$js$ArrayOps$$array$f = null
});
ScalaJS.c.sjs_js_ArrayOps.prototype = new ScalaJS.h.O();
ScalaJS.c.sjs_js_ArrayOps.prototype.constructor = ScalaJS.c.sjs_js_ArrayOps;
/** @constructor */
ScalaJS.h.sjs_js_ArrayOps = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_ArrayOps.prototype = ScalaJS.c.sjs_js_ArrayOps.prototype;
ScalaJS.c.sjs_js_ArrayOps.prototype.seq__sc_IndexedSeq = (function() {
  return new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array(this.scala$scalajs$js$ArrayOps$$array$f)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.init___ = (function() {
  ScalaJS.c.sjs_js_ArrayOps.prototype.init___sjs_js_Array.call(this, []);
  return this
});
ScalaJS.c.sjs_js_ArrayOps.prototype.apply__I__O = (function(index) {
  return this.scala$scalajs$js$ArrayOps$$array$f[index]
});
ScalaJS.c.sjs_js_ArrayOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.scala$scalajs$js$ArrayOps$$array$f["push"](elem);
  return this
});
ScalaJS.c.sjs_js_ArrayOps.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.size__I = (function() {
  return ScalaJS.uI(this.scala$scalajs$js$ArrayOps$$array$f["length"])
});
ScalaJS.c.sjs_js_ArrayOps.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(this.scala$scalajs$js$ArrayOps$$array$f["length"]))
});
ScalaJS.c.sjs_js_ArrayOps.prototype.length__I = (function() {
  return ScalaJS.uI(this.scala$scalajs$js$ArrayOps$$array$f["length"])
});
ScalaJS.c.sjs_js_ArrayOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sjs_js_ArrayOps.prototype.repr__O = (function() {
  return this.scala$scalajs$js$ArrayOps$$array$f
});
ScalaJS.c.sjs_js_ArrayOps.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sjs_js_ArrayOps.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_IndexedSeq())
});
ScalaJS.c.sjs_js_ArrayOps.prototype.init___sjs_js_Array = (function(array) {
  this.scala$scalajs$js$ArrayOps$$array$f = array;
  return this
});
ScalaJS.c.sjs_js_ArrayOps.prototype.stringPrefix__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
ScalaJS.is.sjs_js_ArrayOps = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
});
ScalaJS.as.sjs_js_ArrayOps = (function(obj) {
  return ((ScalaJS.is.sjs_js_ArrayOps(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.ArrayOps"))
});
ScalaJS.isArrayOf.sjs_js_ArrayOps = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
});
ScalaJS.asArrayOf.sjs_js_ArrayOps = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_ArrayOps(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.ArrayOps;", depth))
});
ScalaJS.d.sjs_js_ArrayOps = new ScalaJS.ClassTypeData({
  sjs_js_ArrayOps: 0
}, false, "scala.scalajs.js.ArrayOps", ScalaJS.d.O, {
  sjs_js_ArrayOps: 1,
  O: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.sjs_js_ArrayOps.prototype.$classData = ScalaJS.d.sjs_js_ArrayOps;
ScalaJS.is.sc_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
});
ScalaJS.as.sc_IndexedSeq = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeq"))
});
ScalaJS.isArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
});
ScalaJS.asArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
});
ScalaJS.d.sc_IndexedSeq = new ScalaJS.ClassTypeData({
  sc_IndexedSeq: 0
}, true, "scala.collection.IndexedSeq", (void 0), {
  sc_IndexedSeq: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_Iterable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sc_IndexedSeqLike: 1
});
ScalaJS.is.sc_LinearSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
});
ScalaJS.as.sc_LinearSeq = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeq"))
});
ScalaJS.isArrayOf.sc_LinearSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
});
ScalaJS.asArrayOf.sc_LinearSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
});
ScalaJS.d.sc_LinearSeq = new ScalaJS.ClassTypeData({
  sc_LinearSeq: 0
}, true, "scala.collection.LinearSeq", (void 0), {
  sc_LinearSeq: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_Iterable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sc_LinearSeqLike: 1
});
/** @constructor */
ScalaJS.c.sc_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractSeq.prototype.constructor = ScalaJS.c.sc_AbstractSeq;
/** @constructor */
ScalaJS.h.sc_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractSeq.prototype = ScalaJS.c.sc_AbstractSeq.prototype;
ScalaJS.c.sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractSeq.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
ScalaJS.is.sc_AbstractSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractSeq)))
});
ScalaJS.as.sc_AbstractSeq = (function(obj) {
  return ((ScalaJS.is.sc_AbstractSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.AbstractSeq"))
});
ScalaJS.isArrayOf.sc_AbstractSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractSeq)))
});
ScalaJS.asArrayOf.sc_AbstractSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_AbstractSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.AbstractSeq;", depth))
});
ScalaJS.d.sc_AbstractSeq = new ScalaJS.ClassTypeData({
  sc_AbstractSeq: 0
}, false, "scala.collection.AbstractSeq", ScalaJS.d.sc_AbstractIterable, {
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1
});
ScalaJS.c.sc_AbstractSeq.prototype.$classData = ScalaJS.d.sc_AbstractSeq;
/** @constructor */
ScalaJS.c.sc_AbstractMap = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractMap.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractMap.prototype.constructor = ScalaJS.c.sc_AbstractMap;
/** @constructor */
ScalaJS.h.sc_AbstractMap = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractMap.prototype = ScalaJS.c.sc_AbstractMap.prototype;
ScalaJS.c.sc_AbstractMap.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenMapLike$class__equals__sc_GenMapLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractMap.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_MapLike$class__isEmpty__sc_MapLike__Z(this)
});
ScalaJS.c.sc_AbstractMap.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_MapLike$class__addString__sc_MapLike__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractMap.prototype.hashCode__I = (function() {
  var this$1 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.mapSeed$2)
});
ScalaJS.c.sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
ScalaJS.is.sc_AbstractMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractMap)))
});
ScalaJS.as.sc_AbstractMap = (function(obj) {
  return ((ScalaJS.is.sc_AbstractMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.AbstractMap"))
});
ScalaJS.isArrayOf.sc_AbstractMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractMap)))
});
ScalaJS.asArrayOf.sc_AbstractMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_AbstractMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.AbstractMap;", depth))
});
ScalaJS.d.sc_AbstractMap = new ScalaJS.ClassTypeData({
  sc_AbstractMap: 0
}, false, "scala.collection.AbstractMap", ScalaJS.d.sc_AbstractIterable, {
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1
});
ScalaJS.c.sc_AbstractMap.prototype.$classData = ScalaJS.d.sc_AbstractMap;
/** @constructor */
ScalaJS.c.scm_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.scm_AbstractSeq.prototype.constructor = ScalaJS.c.scm_AbstractSeq;
/** @constructor */
ScalaJS.h.scm_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractSeq.prototype = ScalaJS.c.scm_AbstractSeq.prototype;
ScalaJS.is.scm_AbstractSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_AbstractSeq)))
});
ScalaJS.as.scm_AbstractSeq = (function(obj) {
  return ((ScalaJS.is.scm_AbstractSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.AbstractSeq"))
});
ScalaJS.isArrayOf.scm_AbstractSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_AbstractSeq)))
});
ScalaJS.asArrayOf.scm_AbstractSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_AbstractSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.AbstractSeq;", depth))
});
ScalaJS.d.scm_AbstractSeq = new ScalaJS.ClassTypeData({
  scm_AbstractSeq: 0
}, false, "scala.collection.mutable.AbstractSeq", ScalaJS.d.sc_AbstractSeq, {
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1
});
ScalaJS.c.scm_AbstractSeq.prototype.$classData = ScalaJS.d.scm_AbstractSeq;
ScalaJS.is.sci_List = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
});
ScalaJS.as.sci_List = (function(obj) {
  return ((ScalaJS.is.sci_List(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.List"))
});
ScalaJS.isArrayOf.sci_List = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
});
ScalaJS.asArrayOf.sci_List = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_List(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
});
ScalaJS.d.sci_List = new ScalaJS.ClassTypeData({
  sci_List: 0
}, false, "scala.collection.immutable.List", ScalaJS.d.sc_AbstractSeq, {
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
ScalaJS.c.scm_AbstractMap = (function() {
  ScalaJS.c.sc_AbstractMap.call(this)
});
ScalaJS.c.scm_AbstractMap.prototype = new ScalaJS.h.sc_AbstractMap();
ScalaJS.c.scm_AbstractMap.prototype.constructor = ScalaJS.c.scm_AbstractMap;
/** @constructor */
ScalaJS.h.scm_AbstractMap = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractMap.prototype = ScalaJS.c.scm_AbstractMap.prototype;
ScalaJS.c.scm_AbstractMap.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.is.scm_AbstractMap = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_AbstractMap)))
});
ScalaJS.as.scm_AbstractMap = (function(obj) {
  return ((ScalaJS.is.scm_AbstractMap(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.AbstractMap"))
});
ScalaJS.isArrayOf.scm_AbstractMap = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_AbstractMap)))
});
ScalaJS.asArrayOf.scm_AbstractMap = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_AbstractMap(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.AbstractMap;", depth))
});
ScalaJS.d.scm_AbstractMap = new ScalaJS.ClassTypeData({
  scm_AbstractMap: 0
}, false, "scala.collection.mutable.AbstractMap", ScalaJS.d.sc_AbstractMap, {
  scm_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  scm_Map: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_MapLike: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1
});
ScalaJS.c.scm_AbstractMap.prototype.$classData = ScalaJS.d.scm_AbstractMap;
/** @constructor */
ScalaJS.c.sjs_js_WrappedDictionary = (function() {
  ScalaJS.c.scm_AbstractMap.call(this);
  this.dict$5 = null
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype = new ScalaJS.h.scm_AbstractMap();
ScalaJS.c.sjs_js_WrappedDictionary.prototype.constructor = ScalaJS.c.sjs_js_WrappedDictionary;
/** @constructor */
ScalaJS.h.sjs_js_WrappedDictionary = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedDictionary.prototype = ScalaJS.c.sjs_js_WrappedDictionary.prototype;
ScalaJS.c.sjs_js_WrappedDictionary.prototype.apply__O__O = (function(key) {
  return this.apply__T__O(ScalaJS.as.T(key))
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.init___sjs_js_Dictionary = (function(dict) {
  this.dict$5 = dict;
  return this
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__sjs_js_WrappedDictionary(ScalaJS.as.T2(elem))
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sjs_js_WrappedDictionary$DictionaryIterator().init___sjs_js_Dictionary(this.dict$5)
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.get__T__s_Option = (function(key) {
  var dict = this.dict$5;
  if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, key))) {
    return new ScalaJS.c.s_Some().init___O(this.dict$5[key])
  } else {
    return ScalaJS.m.s_None$()
  }
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.apply__T__O = (function(key) {
  var dict = this.dict$5;
  if (ScalaJS.uZ(ScalaJS.m.sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1["call"](dict, key))) {
    return this.dict$5[key]
  } else {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.$$plus$eq__T2__sjs_js_WrappedDictionary = (function(kv) {
  this.dict$5[ScalaJS.as.T(kv.$$und1$f)] = kv.$$und2$f;
  return this
});
ScalaJS.is.sjs_js_WrappedDictionary = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedDictionary)))
});
ScalaJS.as.sjs_js_WrappedDictionary = (function(obj) {
  return ((ScalaJS.is.sjs_js_WrappedDictionary(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.WrappedDictionary"))
});
ScalaJS.isArrayOf.sjs_js_WrappedDictionary = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedDictionary)))
});
ScalaJS.asArrayOf.sjs_js_WrappedDictionary = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_WrappedDictionary(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.WrappedDictionary;", depth))
});
ScalaJS.d.sjs_js_WrappedDictionary = new ScalaJS.ClassTypeData({
  sjs_js_WrappedDictionary: 0
}, false, "scala.scalajs.js.WrappedDictionary", ScalaJS.d.scm_AbstractMap, {
  sjs_js_WrappedDictionary: 1,
  scm_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  scm_Map: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_MapLike: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1
});
ScalaJS.c.sjs_js_WrappedDictionary.prototype.$classData = ScalaJS.d.sjs_js_WrappedDictionary;
/** @constructor */
ScalaJS.c.scm_AbstractBuffer = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractBuffer.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_AbstractBuffer.prototype.constructor = ScalaJS.c.scm_AbstractBuffer;
/** @constructor */
ScalaJS.h.scm_AbstractBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractBuffer.prototype = ScalaJS.c.scm_AbstractBuffer.prototype;
ScalaJS.is.scm_AbstractBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_AbstractBuffer)))
});
ScalaJS.as.scm_AbstractBuffer = (function(obj) {
  return ((ScalaJS.is.scm_AbstractBuffer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.AbstractBuffer"))
});
ScalaJS.isArrayOf.scm_AbstractBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_AbstractBuffer)))
});
ScalaJS.asArrayOf.scm_AbstractBuffer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_AbstractBuffer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.AbstractBuffer;", depth))
});
ScalaJS.d.scm_AbstractBuffer = new ScalaJS.ClassTypeData({
  scm_AbstractBuffer: 0
}, false, "scala.collection.mutable.AbstractBuffer", ScalaJS.d.scm_AbstractSeq, {
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1
});
ScalaJS.c.scm_AbstractBuffer.prototype.$classData = ScalaJS.d.scm_AbstractBuffer;
/** @constructor */
ScalaJS.c.scm_StringBuilder = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.underlying$5 = null
});
ScalaJS.c.scm_StringBuilder.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_StringBuilder.prototype.constructor = ScalaJS.c.scm_StringBuilder;
/** @constructor */
ScalaJS.h.scm_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_StringBuilder.prototype = ScalaJS.c.scm_StringBuilder.prototype;
ScalaJS.c.scm_StringBuilder.prototype.init___ = (function() {
  ScalaJS.c.scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](idx)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](index)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__C__scm_StringBuilder(ScalaJS.m.sr_BoxesRunTime$().unboxToChar__O__C(elem))
});
ScalaJS.c.scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
ScalaJS.c.scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(thiz["length"]))
});
ScalaJS.c.scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new ScalaJS.c.jl_StringBuilder().init___I(((ScalaJS.uI(initValue["length"]) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return ScalaJS.uI(thiz["length"])
});
ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_StringBuilder.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
ScalaJS.is.scm_StringBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_StringBuilder)))
});
ScalaJS.as.scm_StringBuilder = (function(obj) {
  return ((ScalaJS.is.scm_StringBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.StringBuilder"))
});
ScalaJS.isArrayOf.scm_StringBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_StringBuilder)))
});
ScalaJS.asArrayOf.scm_StringBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_StringBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.StringBuilder;", depth))
});
ScalaJS.d.scm_StringBuilder = new ScalaJS.ClassTypeData({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", ScalaJS.d.scm_AbstractSeq, {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_StringBuilder.prototype.$classData = ScalaJS.d.scm_StringBuilder;
/** @constructor */
ScalaJS.c.sjs_js_WrappedArray = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.array$6 = null
});
ScalaJS.c.sjs_js_WrappedArray.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.sjs_js_WrappedArray.prototype.constructor = ScalaJS.c.sjs_js_WrappedArray;
/** @constructor */
ScalaJS.h.sjs_js_WrappedArray = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedArray.prototype = ScalaJS.c.sjs_js_WrappedArray.prototype;
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6["push"](elem);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(this.array$6["length"]))
});
ScalaJS.c.sjs_js_WrappedArray.prototype.length__I = (function() {
  return ScalaJS.uI(this.array$6["length"])
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
ScalaJS.is.sjs_js_WrappedArray = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
});
ScalaJS.as.sjs_js_WrappedArray = (function(obj) {
  return ((ScalaJS.is.sjs_js_WrappedArray(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
});
ScalaJS.isArrayOf.sjs_js_WrappedArray = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
});
ScalaJS.asArrayOf.sjs_js_WrappedArray = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
});
ScalaJS.d.sjs_js_WrappedArray = new ScalaJS.ClassTypeData({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", ScalaJS.d.scm_AbstractBuffer, {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$classData = ScalaJS.d.sjs_js_WrappedArray;
//# sourceMappingURL=chromi3wm-fastopt.js.map
