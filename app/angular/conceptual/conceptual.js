import "backbone";
import $ from "jquery";

import * as joint from "jointjs";
import "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";
import "../../joint/br-scroller";
import "../../joint/joint.dia.command";
import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

import angular from "angular";
import template from "./conceptual.html";

import shapeFactory from "../service/shapeFactory";

import modelDuplicatorComponent from "../components/duplicateModelModal";

const controller = function (ShapeFactory, ModelAPI, $stateParams, $rootScope, $timeout, $uibModal, $state) {
	const ctrl = this;
	ctrl.feedback = {
		message: "",
		showing: false
	}
	ctrl.loading = true;
	ctrl.model = {
		id: '',
		name: '',
		type: 'conceptual',
		model: '',
		user: $rootScope.loggeduser
	}
	const configs = {
		graph: {},
		paper: {},
		paperScroller: {},
		commandManager: {},
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	}

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = newMessage;
		});
	}

	ctrl.saveModel = () => {
		ctrl.setLoading(true);
		ctrl.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(ctrl.model).then(function (res) {
			ctrl.showFeedback(true, "Salvo com sucesso!");
			ctrl.setLoading(false);
		});
	}

	ctrl.print = () => {
		window.print();
	}

	ctrl.undoModel = () => {
		configs.commandManager.undo();
	}

	ctrl.redoModel = () => {
		configs.commandManager.redo();
	}

	ctrl.zoomIn = () => {
		configs.paperScroller.zoom(0.2, { max: 2 });
	}

	ctrl.zoomOut = () => {
		configs.paperScroller.zoom(-0.2, { min: 0.2 });
	}

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = `${model.name} (cópia)`;
			},
			controllerAs: '$ctrl',
		});
		modalInstance.result.then((newName) => {
			ctrl.setLoading(true);
			const duplicatedModel = {
				id: "",
				name: newName,
				type: model.type,
				model: model.model,
				user: model.who,
			};
			ModelAPI.saveModel(duplicatedModel).then((newModel) => {
				window.open($state.href('conceptual', { 'modelid': newModel._id }));
				ctrl.showFeedback(true, "Duplicado com sucesso!");
				ctrl.setLoading(false);
			});
		});
	};

	ctrl.convertModel = (conceptualModel) => {
		const model = {
			"name": conceptualModel.name + "_convertido",
			"user": $rootScope.loggeduser,
			"type": "logic",
			"model": '{"cells":[]}'
		};
		ModelAPI.saveModel(model)
			.then((newModel) => {
				window.open($state.href('logic', { references: { 'modelid': newModel._id, 'conversionId': conceptualModel._id } }), '_blank');
			});
	}

	const registerPaperEvents = (paper) => {
		paper.on('blank:pointerdown', function (evt, x, y) {
			ctrl.showFeedback(false, "");
			// if (evt.shiftKey) {
			// 	selectionView.startSelecting(evt);
			// } else {
			// 	$scope.paperScroller.startPanning;
			// }
			// $scope.applyChanges();
			// $scope.showFeedback("",false);
			// $scope.selectedElement = {
			// 	element: {},
			// 	value: ""
			// };
			// $scope.roleSelected = "";
			// $scope.entitySelected = 'NONE';
			// $scope.$apply();
		});

		paper.on('link:options', function (cellView, evt, x, y) {
			// var source = $scope.graph.getCell(cellView.model.get('source').id);
			// var target = $scope.graph.getCell(cellView.model.get('target').id);
			// if((cs.isRelationship(source) || cs.isRelationship(target)) &&
			// 	(cs.isEntity(source) || cs.isEntity(target))) {
			// 	if(cellView.model.attributes.labels != null){
			// 		$scope.cardSelected = cellView.model.attributes.labels[0].attrs.text.text;
			// 		$scope.roleSelected = "";
			// 		if(cellView.model.attributes.labels[1] != null) {
			// 			$scope.roleSelected = cellView.model.attributes.labels[1].attrs.text.text;
			// 		}
			// 	}
			// 	$scope.entitySelected = "LINK";
			// 	$scope.selectedElement.element = cellView;
			// 	$scope.$apply();
			// }
		});

		paper.on('cell:pointerup', function (cellView, evt, x, y) {
			// if (cellView.model instanceof joint.dia.Link) return;
			// $scope.onSelectElement(cellView);
			// //conect elementos ao jogar em cima
			// if(x != null && y != null){
			// 	$scope.conectElements(cellView, x, y)
			// }
			// var halo = new joint.ui.Halo({
			// 	cellView: cellView,
			// 	boxContent: false
			// });
			// halo.on('action:link:add', function(link) {
			// 	onLink(link);
			// });
			// halo.on('action:removeElement:pointerdown', function(link) {
			// 	console.log("removing....");
			// });
			// if (cs.isAttribute(cellView.model) || cs.isExtension(cellView.model)) {
			// 	halo.removeHandle('resize');
			// }
			// halo.removeHandle('clone');
			// halo.removeHandle('fork');
			// halo.removeHandle('rotate');
			// halo.render();
		});
	}

	const registerGraphEvents = (graph) => {
		graph.on('change:position', function (cell) {

			// var parentId = cell.get('parent');
			// if (!parentId) return;

			// var parent = $scope.graph.getCell(parentId);
			// var parentBbox = parent.getBBox();
			// var cellBbox = cell.getBBox();

			// if (parentBbox.containsPoint(cellBbox.origin()) &&
			// 	parentBbox.containsPoint(cellBbox.topRight()) &&
			// 	parentBbox.containsPoint(cellBbox.corner()) &&
			// 	parentBbox.containsPoint(cellBbox.bottomLeft())) {
			// 		// All the four corners of the child are inside the parent area.
			// 		return;
			// 	}
			// 	// Revert the child position.
			// 	cell.set('position', cell.previous('position'));
		});

		graph.on('add', function (cell) {

			// Connectando elementos ao realizar drop
			// 	var cellView = $scope.paper.findViewByModel(cell);
			// 	if (cellView.model instanceof joint.dia.Link) return;

			// 	if(cs.isAssociative(cellView.model)) {

			// 		var block = ConceptualFactory.createBlockAssociative();
			// 		block.attributes.position.x = cellView.model.attributes.position.x;
			// 		block.attributes.position.y = cellView.model.attributes.position.y;

			// 		var auto = ConceptualFactory.createRelationship();
			// 		auto.attributes.position.x = block.attributes.position.x + 6;
			// 		auto.attributes.position.y = block.attributes.position.y + 2;

			// 		cellView.model.remove();
			// 		$scope.graph.removeCells(cellView);
			// 		$scope.graph.addCell(block);
			// 		$scope.graph.addCell(auto);

			// 		block.embed(auto);
			// 	}

			// 	if(cs.isComposedAttribute(cellView.model)) {

			// 		var x = cellView.model.attributes.position.x;
			// 		var y = cellView.model.attributes.position.y;
			// 		cellView.model.remove();

			// 		$timeout(function(){
			// 			var base = ConceptualFactory.createAttribute();
			// 			base.attributes.position.x = x + 15;
			// 			base.attributes.position.y = y + 15;
			// 			base.attributes.composed = true;
			// 			$scope.graph.addCell(base);

			// 			var attr1 = ConceptualFactory.createAttribute();
			// 			attr1.attributes.attrs.text.text = "attr1";
			// 			attr1.attributes.position.x = base.attributes.position.x + 50;
			// 			attr1.attributes.position.y = base.attributes.position.y + 20;
			// 			$scope.graph.addCell(attr1);
			// 			createLink(base, attr1);

			// 			var attr2 = ConceptualFactory.createAttribute();
			// 			attr2.attributes.attrs.text.text = "attr2";
			// 			attr2.attributes.position.x = base.attributes.position.x + 50;
			// 			attr2.attributes.position.y = base.attributes.position.y - 20 ;
			// 			$scope.graph.addCell(attr2);
			// 			createLink(base, attr2);

			// 		}, 100);

			// 	}

			// 	if(cellView != null && (cs.isAttribute(cell) || cs.isKey(cell))){
			// 		var x = cellView.model.attributes.position.x;
			// 		var y = cellView.model.attributes.position.y;
			// 		if(x != null && y != null){
			// 			$scope.conectElements(cellView, x, y);
			// 		}
			// 	}
		});

		graph.on('change:position', function (cell) {
			// var parentId = cell.get('parent');
			// if (!parentId) return;

			// var parent = $scope.graph.getCell(parentId);
			// var parentBbox = parent.getBBox();
			// var cellBbox = cell.getBBox();

			// if (parentBbox.containsPoint(cellBbox.origin()) &&
			// 	parentBbox.containsPoint(cellBbox.topRight()) &&
			// 	parentBbox.containsPoint(cellBbox.corner()) &&
			// 	parentBbox.containsPoint(cellBbox.bottomLeft())) {
			// 		// All the four corners of the child are inside the parent area.
			// 		return;
			// 	}
			// 	// Revert the child position.
			// 	cell.set('position', cell.previous('position'));
		});

	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

		configs.commandManager = new joint.dia.CommandManager({ graph: configs.graph })

		const content = $("#content");

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
			cellViewNamespace: joint.shapes
		});

		registerPaperEvents(configs.paper);

		configs.paperScroller = new joint.ui.PaperScroller({
			paper: configs.paper,
			cursor: "grab",
			autoResizePaper: true,
		});

		content.append(configs.paperScroller.render().el);

		const stencil = new joint.ui.Stencil({
			graph: configs.graph,
			paper: configs.paper,
		});

		$("#stencil-holder").append(stencil.render().el);

		stencil.load([
			ShapeFactory.createEntity({ position: { x: 25, y: 10 } }),
			ShapeFactory.createIsa({ position: { x: 40, y: 70 } }),
			ShapeFactory.createRelationship({ position: { x: 25, y: 130 } }),
			ShapeFactory.createAssociative({ position: { x: 15, y: 185 } }),
			ShapeFactory.createAttribute({ position: { x: 65, y: 265 } }),
			ShapeFactory.createKey({ position: { x: 65, y: 305 } }),
			// ShapeFactory.createComposedAttribute()
		]);
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.setLoading(true);
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			ctrl.model = resp.data;
			ctrl.model.model = jsonModel;
			configs.graph.fromJSON(jsonModel);
			ctrl.setLoading(false);
		});
	}

};

export default angular
	.module("app.workspace.conceptual", [shapeFactory, modelDuplicatorComponent])
	.component("editorConceptual", {
		template,
		controller,
	}).name;