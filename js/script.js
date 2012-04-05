$(document).ready(function(){
	//variables
		//This
			var thisElement = $('div.container');
			var documentHeight;
			var documentWidth;
		//content
			var content;
			var articles = {};
			var pageNumber = 1;
			var article	=	0;
			var articleTitles = {};
		//column
			var columnWidth;
		//settings
			var space	=	20;
			var lineHeight	=	25;
			var widthOfColumn = 280;
		
		//startup
		init();
		
		//-------------
		//	1, this function is for statup, and reinitialize
		//-------------
		
		function init(){
			setHeightWidth();
			setArticles();
			flush();
			setLayers();
			setPages();
			gotoPage();
		}
		
		//-------------
		//	2, this function is for flushing content
		//-------------
		
		function flush(){
			thisElement.empty();
		}
		
		//-------------
		//	3, Setting all the layout and layers
		//-------------
		
		function setLayers(){
			thisElement.html('<div class="viewer"></div><div class="menu"></div><div class="toolbar"><a href="#" class="button" id="menu">Menu</a><div class="pageCounter"></div></div>');
			$(".viewer").css("height", getDocHeight()-60+"px");
		}
		
		//-------------
		//	4, setting the dimensions of the document
		//-------------
		
		function setHeightWidth(){
			documentHeight				=	thisElement.outerHeight();
			documentWidth				=	thisElement.outerWidth();
			
			thisElement.css("width", widthOfColumn+"px");
			thisElement.css("width", "100%");
		}
		
		//-------------
		// 5, Gets all article tags and put it into an array
		//-------------
		
		function setArticles(){
			thisElement.children().each(function(_, node) {
				articles[ _ ] = { };
				articles[ _ ]["data-cols"]		=	node.getAttribute('data-cols');
				articles[ _ ]["data-theme"]	=	node.getAttribute('data-theme');
				var count	=	0;
				var items	=	{ };
				var title;
				var titleFound	=	false;
				$(this).children().each(function(_, node) {
					if(node.nodeName != '#text'){
						items[ count ] = { };
						items[ count ]["node"]			=	node.nodeName;
						items[ count ]["value"]			=	node.textContent;
						if(node.nodeName == "H1" && titleFound != true){
							title = node.textContent;
							titleFound = true;
						}
						count++;
					}
				});
				articles[ _ ]["title"]					=	title;
				articles[ _ ]["article"]				=	items;
			});
		}
		
		//-------------
		//	6, all the content will be placed in pages and columns
		//-------------
		
		function setPages(){
			//foreach all articles [start] {
			$.each(articles, function(key, value){
				var totalCounted		=	0;
				var elements			=	value["article"];
				var marge				=	0;
				articleTitles[key]		=	value["title"];
				
				//current values
				var current				=	[];
				current["column"] 	=	1;
				current["page"]		=	0;
				current["element"]	=	-1;
				
				//Height of page [start] {
				var HM	=	(getDocHeight()-120)%lineHeight;
				var heightOfPage	=	(HM < lineHeight/2)
					?(getDocHeight()-120)-HM
					:(getDocHeight()-120)+(lineHeight-HM);	
				//Height of page [end] }
				
				var done = false;
				var marginTop = 0;
				var lastItemHeight;
				
				if(value["data-cols"]*(widthOfColumn+space) > getDocWidth())
				{
					var cols	=	Math.floor(getDocWidth()/(widthOfColumn+space));
				}else{
					var cols	=	value["data-cols"];
				}

				
				do{
					//this makes the first page of an article
					if(current["page"] == 0){
						current["page"]++;
						$(".viewer", thisElement).append('<div class="page page-'+current["page"]+' theme-'+value["data-theme"]+' first" id="article_'+key+'" data-pageNumber="'+current["page"]+'" data-articleNumber="'+key+'" style="width: '+(widthOfColumn+space)+'px; height: '+heightOfPage+'px"><div class="column column_'+current["column"]+'" style="height: '+heightOfPage+'px"></div></div>');
					}
					
					//If needed it makes a new page					
					if(marge == 0){
						current["element"]++;
					}else{
						marginTop = lastItemHeight-marge;
						marge = 0;
					}
					
					//removes half headers
					var remove = false;
					if(heightOfPage-totalCounted < (2*lineHeight) && heightOfPage-totalCounted > 0 && elements[current["element"]]["node"] == 'H2'){
						totalCounted+=heightOfPage-totalCounted;
						remove = true;
					}			
					
					if(elements[current["element"]] == undefined){
						done = true;
						$(".page").hide();
						$(".first#article_0").show();
						$(".page-"+current["page"]+"#article_"+key).addClass("last");
						break;
					}
					
					var iden = key+"_"+current["page"]+"_"+current["column"];
					$(".page-"+current["page"]+"#article_"+key+" .column_"+current["column"]).append('<'+elements[current["element"]]["node"]+' id="'+iden+'">'+elements[current["element"]]["value"]+'</'+elements[current["element"]]["node"]+'>');
					totalCounted += $("#"+iden).height();
					
					//checks if item has to be removed
					if(remove){
						$("#"+iden).hide();
						remove = false;
					}
					
					if(marginTop != 0){
						totalCounted -= marginTop;
						$("#"+iden).css("marginTop", -marginTop+"px");
						marginTop = 0;
					}
					
					lastItemHeight	=	$("#"+iden).height();
					$("#"+iden).removeAttr("id");
					
					
					//this makes a new column
					if(totalCounted > heightOfPage){
						if(current["column"] >= cols){
							current["page"]++;
							current["column"]		=	1;
							$(".viewer", thisElement).append('<div class="page page-'+current["page"]+' theme-'+value["data-theme"]+'" id="article_'+key+'" data-pageNumber="'+current["page"]+'" data-articleNumber="'+key+'" style="width: '+(widthOfColumn+space)+'px; height: '+heightOfPage+'px"></div>');
						}else{
							current["column"]++;
						}
						$(".page-"+current["page"]+"#article_"+key).append('<div class="column column_'+current["column"]+'" style="height: '+heightOfPage+'px"></div>');
						$(".page-"+current["page"]+"#article_"+key).width((widthOfColumn+space)*current["column"]);
						marge = totalCounted-heightOfPage;
						totalCounted = 0;
					}
				}
				while(done != true);
				
			});
			afterLoading();
			//foreach all articles [end] }
		}
		
		function afterLoading(){
			updatePageCounter();
		}
		
		//-------------
		//	7, When the window is resized it will call the function redo()
		//-------------
		
		var timeout = false;
		$(window).resize(function() {
			if (timeout === false) {
				timeout = true;
				setTimeout(redo, 500);
			}
		});
		
		//-------------
		//	8, flushes all the content and reinitializes the document
		//-------------
		
		function redo(){
			flush();
			init();
			timeout = false;
		}
		
		
		//-------------
		//	9, Handeling all of the navigation
		//-------------

		$(document).keydown(function(e){
			if(e.keyCode == 37){
				prevPage();
			}
			if(e.keyCode == 39){
				nextPage();
			}
		});
		
		//-------------
		//	10, goes to the next page
		//-------------
		
		function nextPage(){
			if($(".page-"+(pageNumber+1)+"#article_"+article).is(':hidden'))
			{
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber++;
				$(".page-"+pageNumber+"#article_"+article).fadeIn(500);
			}else if($(".page.first#article_"+(article+1)).is(':hidden')){
				$(".page-"+pageNumber+"#article_"+article).hide();
				article++;
				pageNumber = 1;
				$(".page.first#article_"+article).fadeIn(500);
			}
			updatePageCounter();
		}
		
		//-------------
		//	11, Goes to the prev page
		//-------------
		
		function prevPage(){
			if(article == 0 && pageNumber == 1)
			{
				
			}else if(article == 0){
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber--;
				$(".page-"+pageNumber+"#article_"+article).fadeIn(500);
			}else if(article > 0 && pageNumber == 1){
				
				$(".page-"+pageNumber+"#article_"+article).hide();
				article--;
				$(".page.last#article_"+article).fadeIn(500);
				pageNumber = $(".page.last#article_"+article).attr("data-pagenumber");
			}else if(article > 0){
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber--;
				$(".page-"+pageNumber+"#article_"+article).fadeIn(500);
			}
			updatePageCounter();
		}
		
		function updatePageCounter(){
			$(".pageCounter").html(articleTitles[article]+" ("+pageNumber+" / "+parseInt(($("body").find("#article_"+article+":hidden").length)+1)+")");
		}
		
		function gotoPage(){
			$(".page").hide();
			if(!$(".page-"+pageNumber+"#article_"+article).is(':hidden'))
			{
				pageNumber--;
			}
			$(".page-"+pageNumber+"#article_"+article).show();
		}
		
		
		
		//-------------
		//	13, Handles the swipe action
		//-------------
		
		$("body").touchwipe({
			 wipeLeft: function() { nextPage(); },
			 wipeRight: function() { prevPage(); },
			 wipeUp: function() {  },
			 wipeDown: function() {  },
			 min_move_x: 40,
			 min_move_y: 20,
			 preventDefaultEvents: true
		});
		
		//-------------
		//	14, getting the windows height (for all browsers)
		//-------------
		
		function getDocHeight() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
				Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
				Math.max(D.body.clientHeight, D.documentElement.clientHeight)
			);
		}
		
		//-------------
		//	15, getting the windows width (for all browsers)
		//-------------
		
		function getDocWidth() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
				Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
				Math.max(D.body.clientWidth, D.documentElement.clientWidth)
			);
		}
		
		$("#menu").live('click', function(){
			$(".menu").slideToggle(200);
			return false;
		});
});