# Libraries

Any libs I made to help with userscript development.

## GM_config

A lib that provides an API to store and retrieve userscript settings, and also provides a UI for users to modify them.

```javascript
GM_config(settings, storage = 'cfg')
```

### Usage:

To use this library, require `gm_config.js`. You must also grant `GM_getValue` and `GM_setValue` for it to function. If you want to hook it up to a GreaseMonkey menu command you should also grant `GM_registerMenuCommand`.

Example:

```javascript
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js

const Config = GM_config([
	{
		key: 'opt1'
		label: 'Textbox Option',
		type: 'text'
	}, {
		key: 'opt2',
		label: 'Checkbox Option',
		type: 'bool',
	}, {
		key: 'opt3',
		label: 'Dropdown Option',
		default: 4,
		type: 'dropdown',
		values: [1, 2, 3, 4, 5]
	}
]);
```

### Parameters:

**`settings`**: An array of settings objects.  
**`storage`**: Optional. Defines what variable the settings will be stored under. Default is `cfg`.

### Settings Objects:

**Common Options:**  
```javascript
{
	// The key for the setting.
	key: 'mysetting',

	// The label that'll be used for the setting in the UI.
	label: 'Enter Value',

	// Optional. The default value for the setting.
	default: 'default',

	// What type of setting it is.
	type: 'text|number|dropdown|bool|hidden'
}
```

**Type Specific Options:**

**`text:`** Shows a textbox.
```javascript
{
	// Optional. Placeholder text for the textbox.
	placeholder: 'Placeholder',

	// Optional. Sets the max length of the textbox.
	maxLength: 10,

	// Optional. If true, shows a textarea instead of a text input. Defaults to false.
	multiline: true,

	// Optional. Only applicable when multiline is true. If true the textarea will be resizable. Defaults to false.
	resizable: true
}
```

**`number:`** Show a number spinner.
```javascript
{
	// Optional. Placeholder text for the number spinner.
	placeholder: 'Placeholder',

	// Optional. The minimum value.
	min: 0,

	// Optional. The maximum value.
	max: 10,

	// Optional. The increment size. Defaults to 1.
	step: 0.01
}
```

**`dropdown:`** Shows a dropdown list.
```javascript
{
	// The list of possible options for the dropdown. Each entry can be a value, an object with a text and value property, or an optgroup object.
	values: [
		1,
		{ value: 2, text: 'Option 2'},
		{
			optgroup: 'Group',
			values: [
				3,
				{ value: 4, text: 'Option 4'},
			]
		}
	],

	// Optional. If true show a blank option. Defaults to false.
	showBlank: true
}
```

**`bool:`** Shows a checkbox.

**`hidden:`** Hide the setting from the UI.

### Functions:

**`load()`**: Returns an object containing the currently stored settings.  
**`save(cfg)`**: Takes a configuration object and saves it to storage.  
**`setup()`**: Initializes a UI for the user to modify the settings.

### Using the UI:
You can hook the setup to a GreaseMonkey menu command by granting `GM_registerMenuCommand` and doing the following:

```javascript
GM_registerMenuCommand('Command Text', Config.setup);
```

### Events:
GM_config has the following events:

**`onchange(key, value)`**: Fires when a user changes a setting, but before saving.  
**`onsave(cfg)`**: Fires when the user clicks save.  
**`oncancel(cfg)`**: Fires when the user clicks cancel.

Example:

```javascript
Config.onchange = (key, value) => console.log(key, value);
```
