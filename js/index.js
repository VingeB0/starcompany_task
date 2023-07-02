window.addEventListener("DOMContentLoaded", () => {
    const myRegExp = {
        password: {
            'rule': /(.*[a-z]){4}/i,
            'message': 'Password must be at least more than 3 characters'
        },
        email: {
            'rule': /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            'message': 'Email is not correct'
        }
    }

    function StepForm() {
        const config = {
            HIDDEN_CLASS: 'hidden',
            ACTIVE_CLASS: 'active',
            ERROR_CLASS: 'error-msg--form',
            MAX_STEPS: 5,
            MSG_EMPTY_INPUT: 'Please select your'
        }

        const stepState = () => {
            let _state = 1;
            return {
                next: () => _state = _state + 1,
                prev: () => _state = _state - 1,
                current: () => _state
            }
        }

        const getSteps = () => document.querySelectorAll('.step-item')

        const hideAllSteps = () => {
            const steps = getSteps();
            steps.forEach(item => item.classList.add(config.HIDDEN_CLASS));
        };

        const showSpecificStep = (step = 0) => {
            hideAllSteps();
            const steps = getSteps();
            steps[step].classList.remove(config.HIDDEN_CLASS);
        }

        const getControls = () => {
            const nextHtml = document.querySelector('.step-form__next');
            const prevHtml = document.querySelector('.step-form__prev');
            const start = document.querySelector('.step-form__start');
            return {
                next: {
                    el: nextHtml,
                    disable: () => nextHtml.disabled = true,
                    enable: () => nextHtml.disabled = false,
                    hide: () => nextHtml.classList.add(config.HIDDEN_CLASS),
                    show: () => nextHtml.classList.remove(config.HIDDEN_CLASS)
                },
                prev: {
                    el: prevHtml,
                    disable: () => prevHtml.disabled = true,
                    enable: () => prevHtml.disabled = false
                },
                start: {
                    el: start,
                    hide: () => start.classList.add(config.HIDDEN_CLASS),
                    show: () => start.classList.remove(config.HIDDEN_CLASS)
                }
            }
        }

        const getDots = () => document.querySelectorAll('.dots__item')
        const deactiveAllDots = () => {
            const dots = getDots();
            dots.forEach(item => item.classList.remove(config.ACTIVE_CLASS));
        };
        const showSpecificDot = (number = 0) => {
            deactiveAllDots()
            const dots = getDots();
            dots[number].classList.add(config.ACTIVE_CLASS);
        }

        const getFormItem = (step) => {
            const steps = getSteps();
            const stepItem = steps[step];
            const inputEl= stepItem.querySelector('.step-item__el');
            const helperBox = () => stepItem.querySelector('.step-item__helper-box');
            return {
                // typeEl: () => inputEl.tagName,
                el: () => inputEl,
                value: () => inputEl.value,
                name: () => inputEl.name,
                setError: (text) => {
                    const p = document.createElement('p');
                    const pText = document.createTextNode(text);
                    p.appendChild(pText);
                    p.classList.add(config.ERROR_CLASS);
                    helperBox().appendChild(p);
                },
                clearError: () => {
                    const errorEl = helperBox().querySelector(`.${config.ERROR_CLASS}`);
                    if(errorEl) errorEl.remove();
                }
            }
        }

        return {
            stepState: stepState(),
            getControls,
            showSpecificStep,
            showSpecificDot,
            getFormItem,
            config,
        }
    }

    const { getControls, stepState, showSpecificStep, showSpecificDot, getFormItem, config } = new StepForm();

    const URL = 'http://www.mocky.io/v2/5dfcef48310000ee0ed2c281';
    const fetchErrors = () => fetch(URL)

    const nextAndStartButtons = [getControls().start.el, getControls().next.el];
    nextAndStartButtons.forEach(btn => {
        btn.addEventListener('click', async function () {
            const currentStep = stepState;
            const input = getFormItem(currentStep.current()-1);
            input.clearError();

            const res = await fetchErrors();
            const { errors } = await res.json();


            const inputVal = input.value();
            const name = input.name();
            if(!inputVal.trim()) { //check if empty fields
                const indexError = errors.findIndex(item => item.name === name);
                indexError !== -1 ? input.setError(errors[indexError].message) : input.setError(`${config.MSG_EMPTY_INPUT} ${name}`)
                return false
            }

            const inputRegexp = myRegExp[name];
            const error = inputRegexp && inputRegexp.rule.test(inputVal);
            if(!error && inputRegexp) { //check regexp
                input.setError(inputRegexp.message)
                return false
            }

            if(currentStep.current() < config.MAX_STEPS) stepState.next()

            getControls().next.show();
            getControls().start.hide();

            showSpecificStep(currentStep.current()-1)
            showSpecificDot(currentStep.current()-1)

            if(currentStep.current() > 1) {
                getControls().prev.enable()
            }

            if(currentStep.current() >= config.MAX_STEPS) {
                getControls().next.hide();
                getControls().start.show();
            }
        });
    })

    getControls().prev.el.addEventListener('click', async function () {
        stepState.prev();

        const currentStep = stepState.current();
        showSpecificStep(currentStep-1)
        showSpecificDot(currentStep-1)

        if(currentStep <= 1) {
            getControls().prev.disable()
        }

        if(currentStep < config.MAX_STEPS) {
            getControls().next.show();
            getControls().start.hide();
        }
    });
});