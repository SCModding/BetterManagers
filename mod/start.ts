/// <reference path="../../Types/global.d.ts" />
import type * as StartupCompany from "../../Types";
// https://github.com/DonovanDMC/SCModding/tree/master/Mods/BetterManagers

function UpdateEmployees() {
	Helpers.GetAllEmployees(false).forEach((employee: StartupCompany.Employee & { originalSpeed?: number; originalMaxSpeed?: number; }) => {
		if (![Enums.EmployeeTypeNames.Manager, Enums.EmployeeTypeNames.HrManager, Enums.EmployeeTypeNames.ChiefExecutiveOfficer].some(type => employee.employeeTypeName === type)) return;
		if (!Object.getOwnPropertyDescriptor(employee, "speed")?.get) {
			if (employee.originalSpeed) employee.speed = employee.originalSpeed;
			if (employee.originalMaxSpeed) employee.maxSpeed = employee.originalMaxSpeed;
			employee.originalSpeed = employee.speed;
			employee.originalMaxSpeed = employee.maxSpeed;
			employee.maxSpeed *= Multiplier;
			let _speed = employee.speed * Multiplier;
			delete (employee as { speed?: number; }).speed;
			Object.defineProperty(employee, "speed", {
				get() { return _speed; },
				set(val: number) {
					_speed = Math.max(_speed + ((val - _speed) * Multiplier), 0);
				}
			});
		}
	});
}

const Multiplier = 2;
module.exports = {
	initialize() {
		const originalHelper = Helpers.CalculateMaxInCharge.bind(Helpers);
		Helpers.CalculateMaxInCharge = function CalculateMaxInCharge(employee) {
			let result = originalHelper.call(this, employee);
			if ([Enums.EmployeeTypeNames.Manager, Enums.EmployeeTypeNames.HrManager, Enums.EmployeeTypeNames.ChiefExecutiveOfficer].some(type => employee.employeeTypeName === type)) result *= Multiplier;
			return result;
		};
	},
	onNewHour:  UpdateEmployees,
	onLoadGame: UpdateEmployees
} as ModExports;
