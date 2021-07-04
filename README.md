**C**ustom **C**ascading **S**tyle **S**heets 

---

#Lounch

`$ node index /file.ccss /out.css`

****

#Syntax

#Import

`@import '/file.ccss'`

**PATH** is relative to index location


#Variables 

`$variableName = value`;

**Assign variable:**

```
    selector {
        prop: $variableName;
    }
```

#Mixin

```
    @mixin name {
        field1: value;
        feild2: value;
    }
```

**Assign mixin:**

```
    selector {
        @include name;
        ...props
    }
```

#Nesting

```
    selector {
        nestedSelector {
            ...
        }

        &::pseudoSelector {
            ...
        }
    }
```
