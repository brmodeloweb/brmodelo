import angular from "angular";
import template from "./logic.html";

const controller = function (
	$rootScope,
	$stateParams,
	ModelAPI,
	LogicService,
	$uibModal,
	$state,
	$timeout
) {

	const ctrl = this;

	ctrl.model = LogicService.model;
	ctrl.selectedName = "";
	ctrl.selectedElement = null;
	ctrl.columns = [];
	ctrl.editionVisible = false;
	ctrl.tableNames = [];
	ctrl.mapTables = {};

	ctrl.selectedLink = null;

	ctrl.addColumnVisible = false;
	ctrl.editColumnVisible = false;

	ctrl.feedback = {
		message: "",
		showing: false,
		type: "success"
	}

	ctrl.print = function () {
		window.print();
	}

	ctrl.$onInit = () => {
		ctrl.setLoading(true);
		LogicService.buildWorkspace($stateParams.references.modelid, $rootScope.loggeduser, ctrl.stopLoading, $stateParams.references.conversionId);
	}

	ctrl.closeAllColumns = function () {
		for (var i = 0; i < $scope.columns.length; i++) {
			ctrl.columns[i].expanded = false;
		}
	}

	ctrl.showFeedback = function (newMessage, show, type) {
		ctrl.feedback.message = newMessage;
		ctrl.feedback.showing = show;
		ctrl.feedback.type = type;
	}

	ctrl.stopLoading = function () {
		ctrl.setLoading(false);
	}

	ctrl.saveModel = function () {
		LogicService.updateModel().then(function (res) {
			ctrl.showFeedback("Salvo com sucesso!", true, "success");
		});
	}

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	}

	$rootScope.$on('clean:logic:selection', function () {
		ctrl.showFeedback("", false);
	});

	$rootScope.$on('element:select', function (event, element) {
		ctrl.selectedLink = null;
		ctrl.selectedElement = element;
		if (element != null) {
			ctrl.selectedName = element.attributes.name;
		}
	});

	$rootScope.$on('columns:select', function (event, columns) {
		ctrl.addColumnVisible = false;
		ctrl.columns = [];
		if(columns != null) {
			for (var i = 0; i < columns.length; i++) {
				columns[i].expanded = false;
				ctrl.columns.push(columns[i]);
			}
			ctrl.columns = columns;
		}
	});

	$rootScope.$on('link:select', function (event, selectedLink) {
		ctrl.selectedElement = null;
		ctrl.selectedLink = selectedLink;
	});

	ctrl.updateCardA = function (card) {
		LogicService.editCardinalityA(card);
	}

	ctrl.updateCardB = function (card) {
		LogicService.editCardinalityB(card);
	}

	ctrl.changeName = function () {
		if (ctrl.selectedName != null && ctrl.selectedName != "") {
			LogicService.editName(ctrl.selectedName);
		}
	}

	ctrl.deleteColumn = function (column, $index) {
		LogicService.deleteColumn($index);
	}

	ctrl.editionColumnMode = function (column) {
		ctrl.editColumnModel = JSON.parse(JSON.stringify(column));

		self.closeAllColumns();

		column.expanded = true;
		//LogicService.editColumn($index);
	}

	ctrl.editColumn = function (oldColumn, editedColumn, $index) {
		if (editedColumn.name == "") {
			ctrl.showFeedback("NOME de coluna não pode ficar em branco!", true, "error");
			return;
		}

		// if(editedColumn.FK && editedColumn.tableOrigin.idName == "") {
		// 	 ctrl.showFeedback("Selecione a origem da tabela estrangeira!", true, "error");
		// 	 return;
		// } else {
		// 	column.tableOrigin.idOrigin = self.mapTables.get(column.tableOrigin.idName);
		// }

		LogicService.editColumn($index, editedColumn);

		self.closeAllColumns();
	}

	ctrl.addColumn = function (column) {
		if (column.name == "") {
			ctrl.showFeedback("NOME de coluna não pode ficar em branco!", true, "error");
			return;
		}

		if (column.FK && column.tableOrigin.idName == "") {
			ctrl.showFeedback("Selecione a origem da tabela estrangeira!", true, "error");
			return;
		} else {
			column.tableOrigin.idOrigin = self.mapTables.get(column.tableOrigin.idName);
		}

		LogicService.addColumn(column);
		ctrl.addColumnModel = self.newColumnObject();
		ctrl.addColumnVisible = false;
	}

	ctrl.showAddColumn = function (show) {
		ctrl.addColumnVisible = show;
		ctrl.addColumnModel = self.newColumnObject();

		ctrl.tableNames = [];
		self.mapTables = LogicService.getTablesMap();
		for (var key of self.mapTables.keys()) {
			ctrl.tableNames.push(key);
		}
	}

	ctrl.selectAddType = function (type) {
		if (!ctrl.addColumnModel.PK && !ctrl.addColumnModel.FK) {
			ctrl.addColumnModel.type = type;
		} else {
			ctrl.addColumnModel.type = "INTEGER";
		}
	}

	ctrl.selectEditType = function (type) {
		ctrl.editColumnModel.type = type;
	}

	ctrl.selectAddTableOrigin = function (originName) {
		ctrl.addColumnModel.tableOrigin.idName = originName;
	}

	self.newColumnObject = function () {
		return {
			"FK": false,
			"PK": false,
			"name": "",
			"tableOrigin": {
				"idOrigin": null,
				"idLink": null,
				"idName": ""
			},
			"type": "INTEGER"
		};
	}

	ctrl.addColumnModel = self.newColumnObject();
	ctrl.editColumnModel = self.newColumnObject();

	ctrl.undoModel = function () {
		LogicService.undo();
	}

	ctrl.redoModel = function () {
		LogicService.redo();
	}

	ctrl.zoomIn = function () {
		LogicService.zoomIn();
	}

	ctrl.zoomOut = function () {
		LogicService.zoomOut();
	}

	ctrl.changeVisible = function () {
		ctrl.editionVisible = !ctrl.editionVisible;
	}

	ctrl.generateSQL = function () {
		// var sql = SqlGeneratorService.generate(LogicService.buildTablesJson());

		// var modalInstance = $uibModal.open({
		// 	animation: true,
		// 	templateUrl: 'angular/view/modal/sqlGeneratorModal.html',
		// 	controller: 'SqlGeneratorModalController',
		// 	resolve: {
		// 		params: function () {
		// 			return { 'sql': sql };
		// 		}
		// 	}
		// });

		// modalInstance.result.then(function (model) {
		// 	ModelAPI.saveModel(model).then(function (newModel) {
		// 		self.openModel(newModel);
		// 	});
		// });

	}

	ctrl.duplicateModel = function () {
		let modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/duplicateModelModal.html',
			controller: 'DuplicateModelModalController',
			resolve: {
				params: function () {
					return { 'suggestedName': `${ctrl.model.name} (cópia)` };
				}
			}
		});
		modalInstance.result.then(function (newName) {
			const duplicatedModel = {
				"id": '',
				"name": newName,
				"type": ctrl.model.type,
				"model": JSON.stringify(LogicService.graph),
				"user": ctrl.model.user
			}
			ModelAPI.saveModel(duplicatedModel).then(function (newModel) {
				ctrl.showFeedback("Duplicado com sucesso!", true);
				window.open($state.href('logic', { references: { 'modelid': newModel._id } }));
			});
		});
	}

};

export default angular
	.module("app.workspace.logic", [])
	.component("editorLogic", {
		template,
		controller,
	}).name;